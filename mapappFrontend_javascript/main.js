import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { Draw, Snap, Modify } from 'ol/interaction';
import { WKT } from 'ol/format';
import Overlay from 'ol/Overlay';
import { transform } from 'ol/proj';
import * as geom from 'ol/geom';
import DataTable from 'datatables.net-dt';

const API_URL = 'https://localhost:7252/api/Coordinate';

const iconStyle = new Style({
  image: new Icon({
    src: 'location-pin.png',
    scale: 0.05,
  }),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: (feature) => iconStyle,
});

const raster = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [raster, vector],
  view: new View({
    center: transform([34.0, 39.0], 'EPSG:4326', 'EPSG:3857'),
    zoom: 6.6,
  }),
});

const handleModalDisplay = (modal, display) => {
  modal.style.display = display;
};

const coordinateModal = document.getElementById('coordinate-modal');
const datatableModal = document.getElementById('datatable-modal');

document.querySelectorAll('.close-modal').forEach(span => {
  span.onclick = () => {
    handleModalDisplay(coordinateModal, 'none');
    handleModalDisplay(datatableModal, 'none');
  };
});

window.onclick = (event) => {
  if (event.target === coordinateModal) {
    handleModalDisplay(coordinateModal, 'none');
  } else if (event.target === datatableModal) {
    handleModalDisplay(datatableModal, 'none');
  }
};


let drawing = false;
let draw;
const addInteraction = (type) => {
   draw = new Draw({
    source: source,
    type: type,
   });
  
    map.addInteraction(draw);

  draw.on('drawend', (event) => {
    drawing = false;
    map.removeInteraction(draw);
    const geometry = event.feature.getGeometry();
    const name = prompt("Enter coordinate name:");
    if (name) {
      addCoordinate(name, geometry);
    }
  });

  map.addInteraction(draw);
  map.addInteraction(new Snap({ source: source }));
};

document.getElementById('geometry-type').onchange = (event) => {
  const geometryType = event.target.value;
  map.removeInteraction(draw);
  addInteraction(geometryType);
};


let data = [];

let coordinatesTable = $('#coordinates-table').DataTable({
  columns: [
    { title: 'ID', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'WKT', data: 'wkt' },
    {
      title: 'Actions',
      data: null,
      render: (data, type, row) => `
        <button class="update-btn" data-id="${row.id}">Update</button>
        <button class="delete-btn" data-id="${row.id}">Delete</button>
        <button class="zoom-btn" data-id="${row.id}">Zoom</button>
      `
    }
  ],
  drawCallback: function () {
    $('.zoom-btn').on('click', function () {
      const id = $(this).data('id');
      const rowData = coordinatesTable.row($(this).parents('tr')).data();
      zoomToFeature(rowData.wkt);
    });
    $('.update-btn').on('click', function () {
      const id = $(this).data('id');
      const rowData = coordinatesTable.row($(this).parents('tr')).data();
      openEditModal(rowData);
    });
    $('.delete-btn').on('click', function () {
      const id = $(this).data('id');
      deleteCoordinate(id);
    });
  }
});

const fetchCoordinates = async () => {
  try {
    const response = await fetch(API_URL);
    const data1 = await response.json();
    console.log('fetched data:', data1);
    if (data1) {
    
      coordinatesTable.clear();
      data = [];

      const format = new WKT();
      data1.forEach(item => {
        const feature = format.readFeature(item.wkt, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        feature.setProperties(item);
        source.addFeature(feature);
        data.push(item);
      });

    
      coordinatesTable.rows.add(data).draw();
    } else {
      console.log('Unexpected data structure:', data1);
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }
};

const addCoordinate = async (name, geometry) => {
  const wktFormat = new WKT();
  const wkt = wktFormat.writeGeometry(geometry.transform('EPSG:3857', 'EPSG:4326'));
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: generateUUID(), name, wkt }),
    });
    if (response.ok) {
      alert('Coordinate added successfully.');
      fetchCoordinates(); 
    } else {
      console.error('Error adding coordinate:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding coordinate:', error);
  }
};


const updateCoordinate = async (id, updatedCoordinate) => {
  const wktFormat = new WKT();
  const geometry = wktFormat.readGeometry(updatedCoordinate.wkt);
  const transformedGeometry = geometry.transform('EPSG:3857', 'EPSG:4326');
  const transformedWkt = wktFormat.writeGeometry(transformedGeometry);

  const payload = {
    id: id,
    wkt: transformedWkt,
    name: updatedCoordinate.name
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      alert('Coordinate updated successfully.');
      fetchCoordinates();
    } else {
      console.error('Error updating coordinate:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating coordinate:', error);
  }
};

const deleteCoordinate = async (id) => {
  const confirmDelete = confirm('Are you sure you want to delete this coordinate?');
  if (confirmDelete) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: null
      });
      
      if (response.ok) {
        alert('Coordinate deleted successfully.');
        fetchCoordinates();
      } else {
        console.error('Error deleting coordinate:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting coordinate:', error);
    }
  }
};

const zoomToFeature = (wkt) => {
  try {
    const feature = new WKT().readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    if (feature) {
      const geometry = feature.getGeometry();
      if (geometry) {
        map.getView().fit(geometry.getExtent(), { duration: 1000 });
      } else {
        console.error('Invalid geometry:', wkt);
      }
    } else {
      console.error('Invalid feature:', wkt);
    }
  } catch (error) {
    console.error('Error reading WKT or transforming geometry:', error, wkt);
  }
};

document.getElementById('coordinate-form').onsubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get('id');
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;
  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id || generateUUID(),
        name: formData.get('name'),
        wkt: formData.get('wkt')
      })
    });
    if (response.ok) {
      fetchCoordinates();
      handleModalDisplay(coordinateModal, 'none');
    } else {
      console.error('Error saving coordinate:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving coordinate:', error);
  }
};

$('#coordinates-table tbody').on('click', 'button', async (event) => {
  const button = event.target;
  const id = button.getAttribute('data-id');
  const rowData = coordinatesTable.row($(button).parents('tr')).data();

  if (button.classList.contains('update-btn')) {
    openEditModal(rowData);
  } else if (button.classList.contains('delete-btn')) {
    deleteCoordinate(id);
  } else if (button.classList.contains('zoom-btn')) {
    zoomToFeature(rowData.wkt);
  }
});

const openEditModal = (rowData) => {
  document.getElementById('coordinate-id').value = rowData.id;
  document.getElementById('coordinate-name').value = rowData.name;
  document.getElementById('coordinate-wkt').value = rowData.wkt;
  handleModalDisplay(coordinateModal, 'block');
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('show-coordinates').onclick = async () => {
  await fetchCoordinates();
  handleModalDisplay(datatableModal, 'block');
};
});


document.getElementById('add-coordinate').onclick = () => {
  document.getElementById('coordinate-form').reset();
  document.getElementById('coordinate-id').value = '';
  handleModalDisplay(coordinateModal, 'block');
};


const popup = new Overlay({
  element: document.getElementById('popup'),
  positioning: 'bottom-center',
  stopEvent: false,
  offset: [0, -50],
});
map.addOverlay(popup);

map.on('singleclick', (event) => {
  const coordinate = event.coordinate;
  const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
  
  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    const wktFormat = new WKT();
    const wkt = wktFormat.writeGeometry(feature.getGeometry());

    document.getElementById('coordinate-id').value = feature.getId();
    document.getElementById('coordinate-name').value = feature.get('name');
    document.getElementById('coordinate-wkt').value = wkt;

    const content = document.getElementById('popup-content');
    content.innerHTML = `
      <p><strong>Name:</strong> ${feature.get('name')}</p>
      <p><strong>WKT:</strong> ${wkt}</p>
      <button id="update-btn">Update</button>
      <button id="delete-btn">Delete</button>
    `;
    popup.setPosition(coordinate);
    document.getElementById('update-btn').onclick = async () => {
      const updatedName = document.getElementById('coordinate-name').value;
      const updatedWkt = document.getElementById('coordinate-wkt').value;
      await updateCoordinate(feature.getId(), {
        id: feature.getId(),
        name: updatedName,
        wkt: updatedWkt
      });
      popup.setPosition(undefined);
    };

    document.getElementById('delete-btn').onclick = async () => {
      const confirmDelete = confirm('Are you sure delete this coordinate?');
      if (confirmDelete == true) {
        try {
          const response = await fetch(`${API_URL}${id}`, { method: 'DELETE' });
          if (response.ok) {
            alert('Coordinate deleted successfully.');
            fetchCoordinates();
          } else {
            console.error('Error deleting coordinate:', response.statusText);
          }
        } catch (error) {
          console.error('Error deleting coordinate:', error);
        }
        popup.setPosition(undefined);
      }
    };
  } else {
    popup.setPosition(undefined);
  }
});

document.getElementById('popup-closer').onclick = () => {
  popup.setPosition(undefined);
  return false;
};

// Function to generate a UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

