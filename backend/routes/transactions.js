const express = require("express");
const authMiddleware = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");

const router = express.Router();

// ============================================
// PROTECTED ROUTES - All require authentication
// ============================================
router.use(authMiddleware);

// Transaction CRUD
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);

// Summary/Statistics endpoint (must come before /:id to avoid conflict)
router.get("/summary", transactionController.getTransactionSummary);

// ============================================
// ALERTS ENDPOINTS
// ============================================

// Get all alerts
router.get('/alerts', async (req, res) => {
    try {
        const userId = req.userId;
        const { type, severity, isRead, limit = 50, skip = 0 } = req.query;

        const query = { userId };
        if (type) query.type = type;
        if (severity) query.severity = severity;
        if (isRead !== undefined) query.isRead = isRead === 'true';

        const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 50));
        const parsedSkip = Math.max(0, Number(skip) || 0);

        const [alerts, total] = await Promise.all([
            Alert.find(query)
                .sort({ createdAt: -1 })
                .skip(parsedSkip)
                .limit(parsedLimit)
                .populate('transactionId')
                .lean(),
            Alert.countDocuments(query)
        ]);

        return res.json({
            success: true,
            alerts,
            pagination: {
                total,
                limit: parsedLimit,
                skip: parsedSkip,
                hasMore: (parsedSkip + parsedLimit) < total
            }
        });
    } catch (error) {
        console.error('getAlerts error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to fetch alerts'
        });
    }
});

// Mark all alerts as read
router.patch('/alerts/read-all', async (req, res) => {
    try {
        const result = await Alert.updateMany(
            { userId: req.userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return res.json({
            success: true,
            message: `Marked ${result.modifiedCount} alerts as read`,
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('markAllAlertsRead error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to update alerts'
        });
    }
});

// Get alert statistics
router.get('/alerts/stats', async (req, res) => {
    try {
        const userId = req.userId;
        const [total, unread, unresolved, high, medium, low] = await Promise.all([
            Alert.countDocuments({ userId }),
            Alert.countDocuments({ userId, isRead: false }),
            Alert.countDocuments({ userId, isResolved: false }),
            Alert.countDocuments({ userId, severity: 'high' }),
            Alert.countDocuments({ userId, severity: 'medium' }),
            Alert.countDocuments({ userId, severity: 'low' })
        ]);

        return res.json({
            success: true,
            stats: {
                total,
                unreadCount: unread,
                unresolvedCount: unresolved,
                bySeverity: { high, medium, low }
            }
        });
    } catch (error) {
        console.error('getAlertStats error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to fetch alert statistics'
        });
    }
});

// Mark alert as read
router.patch('/alerts/:id/read', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found',
                message: 'No alert found with this ID'
            });
        }
        return res.json({
            success: true,
            alert,
            message: 'Alert marked as read'
        });
    } catch (error) {
        console.error('markAlertRead error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to update alert'
        });
    }
});

// Resolve alert
router.patch('/alerts/:id/resolve', async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            {
                isResolved: true,
                resolvedAt: new Date(),
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        );
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found',
                message: 'No alert found with this ID'
            });
        }
        return res.json({
            success: true,
            alert,
            message: 'Alert resolved successfully'
        });
    } catch (error) {
        console.error('resolveAlert error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to resolve alert'
        });
    }
});

// Delete alert
router.delete('/alerts/:id', async (req, res) => {
    try {
        const alert = await Alert.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found',
                message: 'No alert found with this ID'
            });
        }
        return res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        console.error('deleteAlert error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to delete alert'
        });
    }
});

// ============================================
// TRANSACTION ENDPOINTS
// ============================================

// Single transaction operations
router.get("/:id", transactionController.getTransaction);
router.patch("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

// Transaction verification endpoint (audit trail)
router.get("/:id/verify", transactionController.verifyTransaction);

module.exports = router;
