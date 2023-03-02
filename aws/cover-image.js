const max = 16;

function getRandomCoverImage(){
    return 'https://cambuzz-rennovex-production.s3.ap-south-1.amazonaws.com/coverImages/'+Math.floor(1+Math.random()*max)+'-min.jpg'
}

module.exports.getRandomCoverImage = getRandomCoverImage;