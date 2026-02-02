const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const User = require('./user');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


const imageSchema = new Schema({
            url: String,
            filename: String
})
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})
const campGroundSchema = new Schema({
    title: String,
    images:[imageSchema],
    price:Number,
    description:String,
    location:String,
    //implement authorization
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    //we added the belw line to embed or include the reviews into the campground model because each campground will
    //have some reviews associated with it (one to many relationship)
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})
/**
 * Mongoose post middleware for `findOneAndDelete` on Campground.
 *
 * When a campground document is deleted using `findByIdandDelete` this middleware is called if you refer to mongoose docs,
 * this middleware automatically removes all Review documents whose
 * ObjectIds are listed in the deleted campground's `reviews` array.
 *
 * This ensures that no orphaned reviews remain in the database after
 * a campground is removed.
 *
 * @param {Object} doc - The deleted campground document returned by Mongoose.
 */
campGroundSchema.post('findOneAndDelete',async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
    
})


module.exports = mongoose.model('Campground',campGroundSchema);