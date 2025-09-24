import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import placeholderImage from './visitors/placeholder.jpg';

function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate');
  const [imageUrl, setImageUrl] = useState(null);
  const [isAuth, setAuth] = useState(false);

  async function SendImage(e) {
    e.preventDefault();

    if (!image) {
      setUploadResultMessage('No image selected. Please choose a file.');
      return;
    }

    const visitorImageName = uuidv4();
    const objectKey = `${visitorImageName}.jpeg`;

    try {
      // ✅ Upload the image to /employee (adjusted endpoint)
      await fetch(`https://th7m7hyrba.execute-api.ap-south-1.amazonaws.com/dev//{bucket}/{filename}/${visitorImageName}.jpg`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpg',
    'X-Object-Key': objectKey
  },
  body: image,
});


      // ✅ Authenticate via GET request
      const response = await Authentication(objectKey);

      if (response?.Message === 'Success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response.lastName}, welcome to work. Hope you have a productive day today.`);
      } else {
        setAuth(false);
        setUploadResultMessage('Authentication Failed: this person is not an employee.');
      }

      const localUrl = URL.createObjectURL(image);
      setImageUrl(localUrl);

    } catch (error) {
      console.error('Upload/Authentication Error:', error);
      setAuth(false);
      setUploadResultMessage('Error during the authentication process. Please try again.');
    }
  }

  async function Authentication(objectKey) {
    const url = `https://rfo8gylm7l.execute-api.ap-south-1.amazonaws.com/facial?objectKey=${encodeURIComponent(objectKey)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  return (
    <div className="App">
      <h2>Facial Recognition System</h2>

      <form onSubmit={SendImage}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Authenticate</button>
      </form>

      <div className={isAuth ? 'Success' : 'Failure'}>
        {uploadResultMessage}
      </div>

      <img
        src={imageUrl || placeholderImage}
        alt="Visitor"
        height={250}
        width={250}
      />
    </div>
  );
}

export default App;
 