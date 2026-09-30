import Complaint from '../models/Complaint.js';import User from '../models/User.js';import cloudinary from '../config/cloudinary.js';import {analyzeComplaint} from '../services/ai.service.js';import {departments} from '../services/department.service.js';import {sendEmail} from '../utils/email.js';import {makeTicket} from '../utils/ticket.js';
function addTimeline(c,status,note,by){c.status=status;c.timeline.push({status,note,by});}
async function uploadImage(file){if(!file)return null;return new Promise((resolve,reject)=>{const stream=cloudinary.uploader.upload_stream({folder:'complainai/complaints',resource_type:'image'},(err,result)=>err?reject(err):resolve(result));stream.end(file.buffer);});}
export async function createComplaint(req,res){try{const {title,description,location}=req.body;if(!title||!description||!location)return res.status(400).json({message:'Title, description and location are required'});let loc;try{loc=typeof location==='string'?JSON.parse(location):location;}catch{return res.status(400).json({message:'Invalid location'});}if(!loc.address||!Number.isFinite(Number(loc.latitude))||!Number.isFinite(Number(loc.longitude)))return res.status(400).json({message:'Please choose a location from the suggestions'});const image=await uploadImage(req.file);const ai=await analyzeComplaint({title,description,location:loc,imageUrl:image?.secure_url});const c=new Complaint({ticketId:makeTicket(),user:req.user._id,title,description,location:loc,image:image?{url:image.secure_url,publicId:image.public_id}:undefined,status:'AI_ANALYZED',category:ai.category,subcategory:ai.subcategory,priority:ai.priority,ai:{...ai,analyzedAt:new Date(),raw:JSON.stringify(ai)},timeline:[]});c.timeline.push({status:'SUBMITTED',note:'Complaint received from citizen',by:req.user._id});c.timeline.push({status:'AI_ANALYZED',note:`AI triage completed. Recommended category: ${ai.category}`,by:req.user._id});await c.save();res.status(201).json(c);}catch(e){console.error(e);res.status(500).json({message:e.message});}}
export async function myComplaints(req,res){const data=await Complaint.find({user:req.user._id}).sort('-createdAt').lean();res.json(data);}
export async function getComplaint(req,res){const c=await Complaint.findOne({$or:[{_id:req.params.id},{ticketId:req.params.id}]}).populate('user','name email').populate('assignedAdmin','name email category');if(!c)return res.status(404).json({message:'Complaint not found'});if(req.user.role==='USER'&&String(c.user._id)!==String(req.user._id))return res.status(403).json({message:'Access denied'});if(req.user.role==='CATEGORY_ADMIN'&&c.category!==req.user.category)return res.status(403).json({message:'Access denied'});res.json(c);}
export async function adminComplaints(req,res){const filter=req.user.role==='CATEGORY_ADMIN'?{category:req.user.category}:{ };const data=await Complaint.find(filter).populate('user','name email').populate('assignedAdmin','name email').sort('-createdAt');res.json(data);}
export async function verifyComplaint(req,res){const c=await Complaint.findById(req.params.id);if(!c)return res.status(404).json({message:'Not found'});if(req.user.role==='CATEGORY_ADMIN'&&c.category!==req.user.category)return res.status(403).json({message:'Access denied'});const {approved,note}=req.body;if(approved){c.assignedAdmin=req.user._id;addTimeline(c,'APPROVED',note||'Complaint verified by category administrator',req.user._id);}else{c.rejectionReason=note||'Rejected during verification';addTimeline(c,'REJECTED',c.rejectionReason,req.user._id);}await c.save();res.json(c);}
export async function forwardComplaint(req,res){const c=await Complaint.findById(req.params.id).populate('user','name email');if(!c)return res.status(404).json({message:'Not found'});if(req.user.role==='CATEGORY_ADMIN'&&c.category!==req.user.category)return res.status(403).json({message:'Access denied'});if(!['APPROVED','IN_PROGRESS'].includes(c.status))return res.status(400).json({message:'Complaint must be approved before forwarding'});const department=departments[c.category]||departments.OTHER;const email=req.body.departmentEmail||department.email;if(!email)return res.status(400).json({message:'Department email is not configured'});c.departmentEmail=email;c.forwardedAt=new Date();addTimeline(c,'FORWARDED',`Forwarded to ${department.name}`,req.user._id);await c.save();await sendEmail({to:email,subject:`Complaint ${c.ticketId} forwarded by ComplainAI`,html:`<h2>Government Complaint Forwarding</h2><p><b>Ticket:</b> ${c.ticketId}</p><p><b>Citizen:</b> ${c.user.name} (${c.user.email})</p><p><b>Category:</b> ${c.category}</p><p><b>Priority:</b> ${c.priority}</p><p><b>Summary:</b> ${c.ai?.summary||c.description}</p><p><b>Location:</b> ${c.location.address}</p><p><b>Description:</b> ${c.description}</p>${c.image?.url?`<p><a href="${c.image.url}">View evidence image</a></p>`:''}`});res.json(c);}
export async function updateStatus(req, res) {
  const c = await Complaint.findById(req.params.id);

  if (!c) {
    return res.status(404).json({
      message: 'Complaint not found'
    });
  }

  if (
    req.user.role === 'CATEGORY_ADMIN' &&
    c.category !== req.user.category
  ) {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  const { status, note } = req.body;

  const allowed = [
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED'
  ];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status'
    });
  }

  // Prevent invalid backwards transitions
  if (status === 'IN_PROGRESS') {
    if (!['APPROVED', 'FORWARDED'].includes(c.status)) {
      return res.status(400).json({
        message: 'Complaint must be approved or forwarded before work starts'
      });
    }
  }

  if (status === 'RESOLVED') {
    if (c.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        message: 'Complaint must be in progress before it can be resolved'
      });
    }
  }

  addTimeline(
    c,
    status,
    note || `Status changed to ${status}`,
    req.user._id
  );

  await c.save();

  res.json(c);
}
export async function closeComplaint(req, res) {
  const c = await Complaint.findById(req.params.id);

  if (!c) {
    return res.status(404).json({
      message: 'Complaint not found'
    });
  }

  if (c.status !== 'RESOLVED') {
    return res.status(400).json({
      message: 'Only resolved complaints can be closed'
    });
  }

  addTimeline(
    c,
    'CLOSED',
    req.body.note || 'Complaint closed by Super Administrator',
    req.user._id
  );

  await c.save();

  res.json({
    message: 'Complaint closed successfully',
    complaint: c
  });
}
export async function archiveComplaint(req, res) {
  const c = await Complaint.findById(req.params.id);

  if (!c) {
    return res.status(404).json({
      message: 'Complaint not found'
    });
  }

  if (c.status !== 'CLOSED') {
    return res.status(400).json({
      message: 'Only closed complaints can be archived'
    });
  }

  c.isArchived = true;
  c.archivedAt = new Date();
  c.archivedBy = req.user._id;

  c.timeline.push({
    status: 'CLOSED',
    note: 'Complaint archived by Super Administrator',
    by: req.user._id
  });

  await c.save();

  res.json({
    message: 'Complaint archived successfully',
    complaint: c
  });
}
export async function unarchiveComplaint(req, res) {
  const c = await Complaint.findById(req.params.id);

  if (!c) {
    return res.status(404).json({
      message: 'Complaint not found'
    });
  }

  c.isArchived = false;
  c.archivedAt = undefined;
  c.archivedBy = undefined;

  c.timeline.push({
    status: c.status,
    note: 'Complaint restored from archive by Super Administrator',
    by: req.user._id
  });

  await c.save();

  res.json({
    message: 'Complaint restored successfully',
    complaint: c
  });
}
export async function analytics(req,res){const filter=req.user.role==='CATEGORY_ADMIN'?{category:req.user.category}:{};const [total,byStatus,byCategory,byPriority]=await Promise.all([Complaint.countDocuments(filter),Complaint.aggregate([{$match:filter},{$group:{_id:'$status',count:{$sum:1}}}]),Complaint.aggregate([{$match:filter},{$group:{_id:'$category',count:{$sum:1}}}]),Complaint.aggregate([{$match:filter},{$group:{_id:'$priority',count:{$sum:1}}}])]);res.json({total,byStatus,byCategory,byPriority});}
