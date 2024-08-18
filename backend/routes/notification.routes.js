import express from 'express'
import { protecteded } from '../middlewares/protected.js'
import { deleteNotification, getNotification } from '../controllers/notification.controllers.js'

const router = express.Router()


router.get('/' , protecteded , getNotification)
router.delete('/' , protecteded , deleteNotification)


export default router