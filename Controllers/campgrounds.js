const Campground = require('../models/campground');
const {cloudinary} = require('../CloudConfig');


module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index',{campgrounds});
}
module.exports.newFormForCampground = (req,res)=>{
    res.render('campgrounds/new');
    }
module.exports.createNewCampground = async (req,res)=>{
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({
    url: f.path,
    filename: f.filename
  }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully created a new campground');
    console.log(`campground added - ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.showCampground = async(req,res)=>{
    const id = req.params.id;
    //get these reviews and authors from the campground schema
    const campground = await Campground.findById(id)
    .populate({
        path: 'reviews',
        populate: { path: 'author' }//this is the author of that review
    }).populate('author');//this author is campground author
    if(!campground){
        req.flash('error','Campground doesnot exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

module.exports.editCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground doesnot exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    //we r using the spread operator ...s 
    //check this later
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (req.files && req.files.length > 0) {
        const imgs = req.files.map(f => ({
            url: f.path,
            filename: f.filename
        }));
        campground.images.push(...imgs);
    }
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {

        await cloudinary.uploader.destroy(filename);

        campground.images = campground.images.filter(img => img.filename !== filename);
            }
    }
    await campground.save();
    req.flash('success','Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Succesfully deleted the campground')
    res.redirect('/campgrounds');
}
