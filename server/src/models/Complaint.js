import mongoose from 'mongoose';
const timelineSchema = new mongoose.Schema({status:String,note:String,by:{type:mongoose.Schema.Types.ObjectId,ref:'User'},at:{type:Date,default:Date.now}},{_id:false});
const complaintSchema = new mongoose.Schema({
  ticketId:{type:String,unique:true,index:true},
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  title:{type:String,required:true,trim:true,maxlength:160},
  description:{type:String,required:true,minlength:20,maxlength:5000},
  location:{
    address:{type:String,required:true},displayName:String,latitude:{type:Number,required:true},longitude:{type:Number,required:true},placeId:String
  },
  image:{url:String,publicId:String},
  status:{type:String,enum:['SUBMITTED','AI_ANALYZED','UNDER_REVIEW','APPROVED','FORWARDED','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'],default:'SUBMITTED',index:true}, 
  isArchived:{type:Boolean,default:false,index:true},
  archivedAt:Date,
  archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  category:{type:String,enum:['ROADS','EDUCATION','HEALTH','ELECTRICITY','WATER','SAFETY','OTHER'],default:'OTHER',index:true},
  subcategory:String,
  priority:{type:String,enum:['LOW','MEDIUM','HIGH','CRITICAL'],default:'MEDIUM'},
  ai:{summary:String,reason:String,confidence:Number,imageObservations:[String],safetyFlags:[String],recommendedDepartment:String,duplicateHint:String,analyzedAt:Date,raw:String},
  assignedAdmin:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  departmentEmail:String,
  forwardedAt:Date,
  rejectionReason:String,
  timeline:[timelineSchema]
},{timestamps:true});
complaintSchema.index({title:'text',description:'text'});
export default mongoose.model('Complaint',complaintSchema);
