import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,minlength:2,maxlength:80},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  password:{type:String,required:true,minlength:8},
  role:{type:String,enum:['USER','CATEGORY_ADMIN','SUPER_ADMIN'],default:'USER'},
  category:{type:String,enum:['ROADS','EDUCATION','HEALTH','ELECTRICITY','WATER','SAFETY',null],default:null},
  isVerified:{type:Boolean,default:true},
  isActive:{type:Boolean,default:true},  otpHash:String,
  otpExpiresAt:Date,
  otpPurpose:{type:String,enum:['PASSWORD_RESET','EMAIL_VERIFY',null],default:null},
  otpAttempts:{type:Number,default:0}
},{timestamps:true});
export default mongoose.model('User',userSchema);
