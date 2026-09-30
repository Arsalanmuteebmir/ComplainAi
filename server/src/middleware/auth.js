import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function auth(req,res,next){
  try{
    const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):null;
    if(!token) return res.status(401).json({message:'Authentication required'});
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(payload.id).select('-password -otpHash');
    if(!req.user) return res.status(401).json({message:'User not found'});
    next();
  }catch(e){return res.status(401).json({message:'Invalid or expired token'});}
}
export const requireRoles=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Insufficient permissions'});
