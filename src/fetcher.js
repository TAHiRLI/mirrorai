import React, { forwardRef, useState } from 'react';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoidGFoaXJsaS50YWhpcnJAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI5MWJhYTU5Yy0wMGVhLTQyNTAtOWI2MC1kMjA3OGI4NTNjY2UiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiZXhwIjoxNzI0NTE0MjA0LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MDAxIn0.6CIufr3-IsuIPoco6G9p_oZWJS3rGI4YjBSakup_7pA";
const Fetcher = () => {
  const [contracts, setContracts] = useState([]);
  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleClick = ()=>{
   
   let formdata = new FormData();
   formdata.append("surname", "Tahir")
   formdata.append("age", "12")

    if (file) {
      formdata.append("mapFile", file); // Append file if it exists
    }
    const url = 'https://localhost:58771/api/tablerows/byId/1';
    
    fetch(url, {
        method: 'POST', // or 'POST'
        body: formdata,
        
        headers: {

            'Authorization': `Bearer ${token}`, 
    
        }
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));



  }
  return (
    <div>
     <input type="file" onChange={handleFileChange} />
     <button onClick={handleClick}>Klicj</button>
      <div>
        {contracts.length > 0 ? (
          <ul>
            {contracts.map((contract, index) => (
              <li key={index}>{JSON.stringify(contract)}</li>
            ))}
          </ul>
        ) : (
          <p>No contracts fetched</p>
        )}
      </div>
    </div>
  );
};

export default Fetcher;
