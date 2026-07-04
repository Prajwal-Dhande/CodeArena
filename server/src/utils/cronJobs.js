const cron = require('node-cron')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { sendExpiryEmail } = require('../services/emailService')
const DailyQuest = require('../models/DailyQuest')
const Problem = require('../models/Problem')

/**
 * Premium Expiry Cron Job
 * Runs daily at 9:00 AM IST (3:30 AM UTC) to check for expiring plans.
 * Sends email + in-app notification when:
 *  - Plan expires in exactly 4 days
 *  - Plan expires in exactly 1 day (24 hours)
 */
const startExpiryCheckCron = () => {
  // Run every day at 3:30 AM UTC (9:00 AM IST)
  cron.schedule('30 3 * * *', async () => {
    console.log('🔔 [Cron] Running premium expiry check...')

    try {
      const now = new Date()

      // Find all premium users with a valid expiry date
      const premiumUsers = await User.find({
        isPremium: true,
        premiumExpiry: { $exists: true, $ne: null }
      }).select('username email premiumExpiry')

      let emailsSent = 0
      let notificationsCreated = 0

      for (const user of premiumUsers) {
        const expiry = new Date(user.premiumExpiry)
        const msRemaining = expiry.getTime() - now.getTime()
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

        // Check if 5 days or less remaining
        if (daysRemaining <= 5 && daysRemaining > 0) {
          // Send email
          try {
            await sendExpiryEmail(user.email, user.username, daysRemaining)
            emailsSent++
          } catch (emailErr) {
            console.error(`❌ [Cron] Failed to send expiry email to ${user.email}:`, emailErr.message)
          }

          // Create in-app notification
          try {
            const isUrgent = daysRemaining === 1
            await Notification.create({
              user: user._id,
              title: isUrgent ? '⚠️ PRO Expires Tomorrow!' : `🔔 PRO Expires in ${daysRemaining} Days`,
              message: isUrgent
                ? 'Your NodeClash PRO plan expires tomorrow! Renew now to keep access to The Elite Archive, Clara AI, and all premium features.'
                : `Your NodeClash PRO plan expires in ${daysRemaining} days. Renew to continue your competitive edge.`,
              type: isUrgent ? 'error' : 'warning',
              link: '/premium'
            })
            notificationsCreated++
          } catch (notifErr) {
            console.error(`❌ [Cron] Failed to create notification for ${user.username}:`, notifErr.message)
          }
        }

        // Also handle already-expired plans — deactivate them
        if (daysRemaining <= 0) {
          try {
            await User.findByIdAndUpdate(user._id, {
              isPremium: false,
              premiumPlan: 'free'
            })

            await Notification.create({
              user: user._id,
              title: '❌ PRO Plan Expired',
              message: 'Your NodeClash PRO plan has expired. You are now on the Free tier. Upgrade anytime to regain access.',
              type: 'error',
              link: '/premium'
            })

            console.log(`🔄 [Cron] Deactivated expired plan for ${user.username}`)
          } catch (deactivateErr) {
            console.error(`❌ [Cron] Failed to deactivate plan for ${user.username}:`, deactivateErr.message)
          }
        }
      }

      console.log(`✅ [Cron] Expiry check complete. Emails sent: ${emailsSent}, Notifications: ${notificationsCreated}, Total premium users scanned: ${premiumUsers.length}`)
    } catch (err) {
      console.error('❌ [Cron] Expiry check failed:', err)
    }
  }, {
    timezone: 'Asia/Kolkata'
  })

  console.log('✅ [Cron] Premium expiry checker scheduled (daily at 9:00 AM IST)')

  // ── Daily Quest Cron ──
  // Runs at midnight IST (6:30 PM UTC previous day) to create next day's quest
  cron.schedule('30 18 * * *', async () => {
    try {
      const tomorrow = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const istDate = new Date(tomorrow.getTime() + istOffset + 24 * 60 * 60 * 1000)
      const dateStr = istDate.toISOString().split('T')[0]

      // Check if already created
      const existing = await DailyQuest.findOne({ date: dateStr })
      if (existing) {
        console.log(`🎯 [Cron] Daily Quest already exists for ${dateStr}`)
        return
      }

      // Get recently used slugs
      const recentQuests = await DailyQuest.find().sort({ date: -1 }).limit(14).select('problemSlug')
      const recentSlugs = recentQuests.map(q => q.problemSlug)

      // Pick random unused problem
      let problem = await Problem.aggregate([
        { $match: { isActive: true, 'testCases.0': { $exists: true }, slug: { $nin: recentSlugs } } },
        { $sample: { size: 1 } }
      ])

      if (!problem || problem.length === 0) {
        problem = await Problem.aggregate([
          { $match: { isActive: true, 'testCases.0': { $exists: true } } },
          { $sample: { size: 1 } }
        ])
      }

      if (problem && problem.length > 0) {
        const p = problem[0]
        await DailyQuest.create({
          date: dateStr,
          problemSlug: p.slug,
          problemTitle: p.title,
          difficulty: p.difficulty,
          category: p.category || ''
        })
        console.log(`🎯 [Cron] Created Daily Quest for ${dateStr}: ${p.title} (${p.difficulty})`)
      }
    } catch (err) {
      console.error('❌ [Cron] Daily Quest creation failed:', err)
    }
  })
  console.log('✅ [Cron] Daily Quest scheduler active (pre-generates at 6:30 PM UTC)')
}

module.exports = { startExpiryCheckCron }
