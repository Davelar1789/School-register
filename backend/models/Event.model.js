import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['holiday', 'custom'],
      required: true
    },
    title: {
      type: String,
      required: function () {
        return this.type === 'custom';
      },
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'createdByModel'
    },
    createdByModel: {
      type: String,
      enum: ['User', 'Teacher'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient querying
eventSchema.index({ school: 1, date: 1 });

// Virtual for formatted date
eventSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
