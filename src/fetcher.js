import React, { forwardRef, useState } from 'react';
import obj from './item.json'


const Fetcher = () => {
  const [contracts, setContracts] = useState([]);
  const handleClick = ()=>{
   obj.forEach(element => {
     console.log(`$.parent.std.guid==\"${element.std.guid}\"` )
    
   });

  }
  return (
    <div>
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
