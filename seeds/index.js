const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {descriptors , places} = require('./seedhelper');
const cities = require('./cities');
/////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//to check if the database is connected succesfully
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
    console.log('Connected to MongoDB');
    });
const sample = array=>array[Math.floor(Math.random()*array.length)];
const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const newCamp = new Campground({
            author: '6972f12bc43107395b266f35',//just for implementing authorisation
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[random].city}, ${cities[random].state}`,
            images:[
                {
                  url: 'https://res.cloudinary.com/drhk33p6k/image/upload/v1769998672/CampSites/ddaug8rnrpomwyhvuddj.jpg',
                filename: 'CampSites/ddaug8rnrpomwyhvuddj',
                _id: '69800951d43aeaacd822b47b'  
                }
            ],
            price:price,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum inventore omnis cum corporis, accusantium aliquid. Veniam voluptatibus ex aspernatur accusantium possimus exercitationem, impedit accusamus! Incidunt ea alias expedita velit enim.'
        });
        console.log(`Added: ${newCamp.title}`);
        console.log(newCamp.price)
        console.log(newCamp.author)

        await newCamp.save();

    }
};
seedDB().then(()=>{
    mongoose.disconnect();
    });
