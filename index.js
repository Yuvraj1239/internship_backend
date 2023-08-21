const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'nopassword',
    database: 'internship'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

const app = express();
app.use(fileUpload());
app.use(cors())
const server = http.createServer(app);
const io = socketIo(server);




io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('submitFormData', async (formData) => {
        console.log('Form data received:', formData);
        const directoryPath = __dirname+'/photo/'+formData.first_name;
        fs.mkdir(directoryPath,{recursive:true},(error) =>{
        	if (error){
        		console.error('Error creating directory:',error);

        	}
        	else{
        		console.log('Directory created successsfully');
        	}
        })

        try {
        	console.log(formData.photo);
        	const photoFile = formData.photo;
        	if(!photoFile){
        		console.error("no photo");
        		return;
        	}
        	console.log(photoFile);
        	console.log(__dirname)
        	console.log(formData.photo.name);
        	const photofilename = formData.first_name+'.jpg';
            const photoPath = path.join(directoryPath,photofilename);
            console.log(photoPath)
            fs.writeFileSync(photoPath,formData.photo)

            // Save the photo to a designated folder
            try {

                

                // Save data to MySQL
                const query = `
                    INSERT INTO user_data
                    SET
                        first_name = ?,
                        last_name = ?,
                        father_name = ?,
                        email = ?,
                        mobile = ?,
                        gender = ?,
                        photo = ?,
                        dob = ?,
                        hobbies = ?,
                        address = ?,
                        city = ?
                `;

                const values = [
                    formData.first_name,
                    formData.last_name,
                    formData.father_name,
                    formData.email,
                    formData.mobile,
                    formData.gender,
                   	directoryPath,
                    formData.dob,
                    formData.hobbies,
                    formData.address,
                    formData.city
                ];

                connection.query(query, values, (error, results) => {
                    if (error) {
                        console.error('Error inserting data:', error);
                    } else {
                        console.log('Data inserted into MySQL:', results);
                    }
                });
            } catch (error) {
                console.error('Error saving image:', error);
            }
        } catch (error) {
            console.error('Error processing form data:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
