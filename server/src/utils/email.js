import nodemailer from 'nodemailer';
const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT||587)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
export async function sendEmail({to,subject,html}){
  if(!process.env.SMTP_USER || !process.env.SMTP_PASS){console.log(`[EMAIL DEMO] To: ${to} | ${subject}`);return {demo:true};}
  return transporter.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,html});
}
export async function sendOtpEmail(to,otp){return sendEmail({to,subject:'ComplainAI password reset OTP',html:`<div style="font-family:Arial"><h2>Password reset</h2><p>Your one-time password is:</p><h1>${otp}</h1><p>This OTP expires in 10 minutes and can only be used once.</p></div>`});}
