import multer from 'multer';
const storage=multer.memoryStorage();
export const upload=multer({storage,limits:{fileSize:8*1024*1024},fileFilter:(req,file,cb)=>file.mimetype.startsWith('image/')?cb(null,true):cb(new Error('Only image files are allowed'))});
