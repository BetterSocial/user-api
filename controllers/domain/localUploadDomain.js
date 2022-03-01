const fs = require('fs')
const {
    DomainPage
} = require("../../databases/models");

const { v4: uuidv4 } = require('uuid');

module.exports = async(req, res) => {
    /**
     * 
     * @param {String} fileName 
     */
    const getDomainNameFromFileName = (fileName) => {
        let [name] = fileName.split('.')
        return name.split('_').join('.')
    }
    
    try {
        let files = fs.readdirSync('./domains')
        console.log(files)
    
        for(let index in files) {
            let file = files[index]
            // console.log(getDomainNameFromFileName(file))
            let name = getDomainNameFromFileName(file)
            await DomainPage.create({
                domain_page_id: uuidv4(),
                domain_name: name,
                logo: `https://res.cloudinary.com/hpjivutj2/image/upload/v1/domain-image/${file}`,
                short_description: '',
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }
        
        res.status(200).json({
            success: true,
            data: files
        })    
    } catch(e) {
        console.log(e)
        res.status(200).json({
            success: false
        })  
    }
}