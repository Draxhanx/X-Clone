import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";

export const getNotification =async (req , res)=>{

    try {
        const userId = req.user.id
        console.log(userId)
     const user = await User.findById(userId)
     if(!user){
         return res.status(404).json({msg: 'User not found'});
     }

     const notifications = await Notification.find({to : userId }).populate({
         path: 'from',
         select: 'username , profileimg'
     })

     await Notification.updateMany({to : userId},{ read: true})
   res.status(200).json(notifications)
        
    } catch (error) {
         res.status(500).json({msg: 'Server Error'});
         console.error(error + "Error In  getNotification");
        
    }
}


export const deleteNotification = async (req , res)=>{
 try {
    const userId = req.user._id

    await Notification.deleteMany({to : userId})
    res.status(200).json({msg: 'Notifications deleted successfully'})
    
 } catch (error) {
     res.status(500).json({msg: 'Server Error'});
     console.error(error + "error in deleteNotification");
    
 }
}
