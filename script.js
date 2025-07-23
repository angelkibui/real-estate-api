// Load listings from API
async function loadProperties() {
  const url = 'https://realtor-data1.p.rapidapi.com/property_list';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': '00225178b0msh5fc4ca96d725123p18e20cjsn8683c26792e2',
      'X-RapidAPI-Host': 'realtor-data1.p.rapidapi.com'
    },
    body: JSON.stringify({
      query: {
        status: ["for_sale"],
        postal_code: "10022", // You can change this to another zip
      },
      limit: 5
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const list = data.data.home_search.results;

    const propertiesDiv = document.getElementById('properties');
    list.forEach(property => {
      const div = document.createElement('div');
      div.className = 'property';
      div.innerHTML = `
        <strong>${property.primary_photo ? `<img src="${property.primary_photo.href}" width="100">` : ''}</strong>
        <p><strong>Price:</strong> $${property.list_price}</p>
        <p><strong>Address:</strong> ${property.location.address.line}, ${property.location.address.city}</p>
      `;
      propertiesDiv.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    alert("Sorry, something went wrong 😢");
  }
}

loadProperties();

