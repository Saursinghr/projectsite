const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: false,
        minlength: 6
    },
    confirmPassword: {
        type: String,
        required: false,
        minlength: 6
    },
    position: {
        type: String,
        required: false,
        trim: true,
        default: 'Employee'
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    companyCode: {
        type: String,
        trim: true,
        default: ''
    },
    additionalAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    assignedSite: {
        type: [String], // Array of site names/IDs to support multiple sites
        default: []
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    // Authentication fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    // Forgot password fields
    forgotPasswordOTP: {
        type: String
    },
    forgotPasswordOTPExpiry: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user'
    },
    isAdminVerified: {
        type: Boolean,
        default: false
    },
    adminVerifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    adminVerifiedAt: {
        type: Date
    },
    // NOTE: assignedSites field is deprecated - use assignedSite instead
    // Keeping for backward compatibility but should not be used
    assignedSites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'newConstruction'
    }],
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }
}, { 
    timestamps: true,
    collection: 'Employees'
});

// Create index for better search performance
// EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ position: 1 });

// Pre-save middleware to hash password
EmployeeSchema.pre('save', async function(next) {
    // Only hash password if it's provided and modified
    if (!this.password || !this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = this.password; // Set confirmPassword to match
        next();
    } catch (error) {
        next(error);
    }
});

// Generate OTP for email verification
EmployeeSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationOTP = otp;
    this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Verify OTP
EmployeeSchema.methods.verifyOTP = function(otp) {
    if (!this.emailVerificationOTP || !this.otpExpiry) {
        return false;
    }
    
    if (Date.now() > this.otpExpiry) {
        this.emailVerificationOTP = undefined;
        this.otpExpiry = undefined;
        return false;
    }
    
    if (this.emailVerificationOTP !== otp) {
        return false;
    }
    
    // Clear OTP after successful verification
    this.emailVerificationOTP = undefined;
    this.otpExpiry = undefined;
    this.isEmailVerified = true;
    return true;
};

// Generate OTP for forgot password
EmployeeSchema.methods.generateForgotPasswordOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.forgotPasswordOTP = otp;
    this.forgotPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Verify forgot password OTP
EmployeeSchema.methods.verifyForgotPasswordOTP = function(otp) {
    if (!this.forgotPasswordOTP || !this.forgotPasswordOTPExpiry) {
        return false;
    }
    
    if (Date.now() > this.forgotPasswordOTPExpiry) {
        this.forgotPasswordOTP = undefined;
        this.forgotPasswordOTPExpiry = undefined;
        return false;
    }
    
    if (this.forgotPasswordOTP !== otp) {
        return false;
    }
    
    // Clear OTP after successful verification
    this.forgotPasswordOTP = undefined;
    this.forgotPasswordOTPExpiry = undefined;
    return true;
};

// Compare password
EmployeeSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
EmployeeSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
EmployeeSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Reset login attempts
// EmployeeSchema.methods.resetLoginAttempts = function() {
//     return this.updateOne({
//         $unset: { loginAttempts: 1, lockUntil: 1 },
//         $set: { loginAttempts: 0 }
//     });
// };

module.exports = mongoose.model('Employee', EmployeeSchema); 