# File-upload-delete-view-in-mongo
A file upload, delete and view app using MongoDB, Express, nodeJS.
This app allows user to add a image to their mongoDB database, View the images in their database and delete files from their database.  
# Features 
## 1. Upload a File
Select a file from your PC to upload to the MongoDB database.
![Upload](http://github.com/naziya-19/image-upload-delete-view-in-mongo/screenshots 2023-08-07 15.23.35.png "Select a File")

## 2. View the File
You can view the File by clicking on the view button.
You can also see all the files uploaded on the database.

## 3. Delete a File
Click the delete button to remove the file from your MongoDB database.

# Installation 
For Installation 
1. Clone the Repo
2. Install all the modules by typing 
```npm install```
3. Enter your MongoDb URI in mongoURI variable in line 18 of app.js <br>
```const mongoURI = 'mongodb://127.0.0.1:27017'```
4. Run the Program by
```npm start```
