import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { cilPencil } from "@coreui/icons"
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CModal,
  CForm,
  CFormLabel,
  CFormInput,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
} from '@coreui/react'
import '../css/defaultstyle.css';
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Typography,
  Tooltip,
  IconButton,
  Input,
} from '@material-tailwind/react'
import { TrashIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router';

export default function VehicleTable() {
  // VIEW VEHICLES START  //
  const TABLE_HEAD = ["VEHICLE PLATE", "VEHICLE TYPE", "CAPACITY", "", ""];
  const [tableData, setTableData] = useState([]);
  const vendorid = localStorage.getItem('userid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehicles/${vendorid}`)
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  //  VIEW VEHICLES END  //


  // CREATE FUNCTION START //
  // Hook to toggle visibility of create vehicle modal
  const [createModalVisible, setCreateModalVisible] = useState(false)

  // Hooks which will save the inputs in the create vehicle modal,
  // The inputs will then be submitted to the post request API later
  const [ vehiclePlate, setVehicleplate ] = useState('');
  const [ vehicleType, setVehicletype ] = useState('');
  const [ capacity, setCapacity ] = useState('');

  // Method to clear the create vehicle inputs
  const handleClearForm = () => {
    setVehicleplate('')
    setVehicletype('')
    setCapacity('')
  };

  // Handle create vehicle
  const handleCreateVehicle = async () => {
    try {
      // Basic frontend validation first, before sending post request
      // If any of the input fields are are empty, do not proceed with axios post req. 
      if (!vehiclePlate.trim() || !vehicleType.trim() || !capacity.trim()) {
        alert('Fill in all fields first before creating the vehicle')
        return;
      }
      
      // Else proceed with post request
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-createvehicle', { vp: vehiclePlate, vt: vehicleType, c: capacity, vi: vendorid });

      const apiresult = res.data;
      if (apiresult.success) {
        alert('Vehicle successfully created')
        handleClearForm();
        setCreateModalVisible(false);
        window.location.reload();
      } else {
        alert(apiresult.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // CREATE FUNCTION END //


  //  UPDATE FUNCTION START  //
  // Variables that will be used in the update vehicle modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedVehicletype, setUpdatedVehicletype] = useState('');
  const [updatedCapacity, setUpdatedCapacity] = useState('');

  const showUpdateModal = ( vehicleplate, vehicletype, capacity ) => {
    setVehicleplate(vehicleplate)
    setUpdatedVehicletype(vehicletype)
    setUpdatedCapacity(capacity)
    setUpdateModalVisible(true);
  };
  
  // Handle updating vehicle details
  const handleUpdateVehicle = async () => {
    try {
      // Perform basic validation
      // Check that atleast inputs are different from table row data before proceeding with update query in axios put
      // Find the specific row data based on the vehicle plate (which was set by state hook)
      const rowData = tableData.find(data => data.vehicle_Plate === vehiclePlate);
      const isUpdated = updatedVehicletype !== rowData.vehicle_Type || updatedCapacity !== rowData.capacity;

      if (!isUpdated) {
        alert('No changes made. Change either the vehicle type or capacity first before updating');
        return;
      }

      // Perform the update API request using axios
      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-updatevehicle', {  
        vp: vehiclePlate, uvt: updatedVehicletype, uc: updatedCapacity
      });
  
      // Handle the response
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Vehicle successfully updated');
        setUpdateModalVisible(false);
        window.location.reload();
      } else {
        // View error
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // UPDATE FUNCTION END  //


  //  DELETE FUNCTION START  //
  // Hook to toggle visibility of delete vehicle modal, and to store the vehicle plate that was selected by user
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingVehicleplate, setDeletingVehicleplate] = useState('');   

  const showDeleteConfirmation = (vehicleplate) => {
    setDeleteModalVisible(true);
    setDeletingVehicleplate(vehicleplate);
  };

  // Handle the deletion of an vehicle account
  const handleDeleteVehicle = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-deletevehicle', { data: { deletingVehicleplate } });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Vehicle successfully deleted');
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
    }
  };
  //  DELETE FUNCTION END //


  // UPLOAD BUTTON NAVIGATION //
  const navigate = useNavigate('')
  const navigateToUploadVehicle = () => {
    navigate('/vendor/uploadvehicle')
  }


  // Hooks for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;  // number of rows to display
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Hook for search
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} 
        >
          Vehicle Management
        </p>

        {/* Upload Vehicle Button */}
        <CButton 
          onClick={navigateToUploadVehicle}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" 
        >
          Upload Vehicle
        </CButton>
        
        {/* Create Vehicle Button */}
        <div style={{marginLeft: '10px'}}>
          <CButton 
            onClick={() => setCreateModalVisible(!createModalVisible)}
            style={{  
              '--cui-btn-color': 'white',
              '--cui-btn-bg': '#56844B',
              '--cui-btn-border-color': 'transparent',
              '--cui-btn-hover-bg': '#56844B',
              '--cui-btn-hover-border-color': '#56844B',
            }}
            className="px-2 py-2"
          >
            Create Vehicle
          </CButton>
        </div>

        {/* Create Vehicle Modal */}
        <CModal scrollable visible={createModalVisible} onClose={() => setCreateModalVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Vehicle</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Creating vehicle for vendor</CFormLabel>
              <CFormInput 
                value={vendorid} 
                className='mb-2'
                disabled
              />
              <CFormLabel>Vehicle Plate</CFormLabel>
              <CFormInput 
                value={vehiclePlate}
                onChange={(e) => setVehicleplate(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Vehicle Type</CFormLabel>
              <CFormInput 
                value={vehicleType}
                onChange={(e) => setVehicletype(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Capacity</CFormLabel>
              <CFormInput 
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className='mb-2'
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateVehicle}
            >
              Create
            </CButton>
            <CButton 
              color='light'
              style ={{ width: '70%'}}
              onClick={handleClearForm}
            >
              Clear Form
            </CButton>
          </CModalFooter>
        </CModal>
      </div>

      {/* Search box */}
      <div className='py-4'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vehicle plate"
        />
      </div>

      {/* Vehicle Overview Table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {tableData.length === 0 ? (
            <Typography className="p-4">No vehicles available</Typography>
          ) : (
            <table className="w-full min-w-max table-auto text-left">
              <thead className="bg-gray-200">
                <tr>
                  {TABLE_HEAD.map((head, idx) => (
                    <th key={`${head}-${idx}`} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <Typography
                        color="black"
                        className="font-normal leading-none opacity-80">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData
                  .filter((row) => row.vehicle_Plate.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={data.vehicle_Plate}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.vehicle_Plate}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.vehicle_Type}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.capacity}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.vehicle_Plate, data.vehicle_Type, data.capacity)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.vehicle_Plate)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* Update vehicle modal */}
                <CModal backdrop='static' scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Vehicle
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CForm className="overflow-auto">
                      <CFormLabel>Vehicle Plate</CFormLabel>
                      <CFormInput 
                        value={vehiclePlate} 
                        className="mb-2"
                        disabled 
                      />
                      <CFormLabel>Vehicle Type</CFormLabel>
                      <CFormInput
                        value={updatedVehicletype}
                        onChange={(e) => setUpdatedVehicletype(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Capacity</CFormLabel>
                      <CFormInput
                        value={updatedCapacity}
                        onChange={(e) => setUpdatedCapacity(e.target.value)}
                        className="mb-2"
                      />
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateVehicle}>
                      Update
                    </CButton>
                    <CButton color="light" style={{ width: '70%' }} onClick={() => setUpdateModalVisible(false)}>
                      Cancel
                    </CButton>
                  </CModalFooter>
                </CModal>

                {/* Delete confirmation modal */}
                <CModal scrollable visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Confirm Deletion
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <p>Are you sure you want to delete this vehicle?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteVehicle} color="light">
                      Confirm
                    </CButton>
                    <CButton onClick={() => setDeleteModalVisible(false)} color="secondary">
                     Cancel
                    </CButton>
                  </CModalFooter>
                </CModal>
              </tbody>
            </table>
          )}
        </CardBody>

        {/* Pagination for table */}
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Button 
            variant="outlined" color="blue-gray" 
            size="sm" disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from(Array(Math.ceil(tableData.length / rowsPerPage)).keys()).map((page) => (
              <IconButton
                key={page + 1} variant={currentPage === page + 1 ? "outlined" : "text"}
                color="blue-gray" 
                size="sm"
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </IconButton>
            ))}
          </div>
          <Button
            variant="outlined" color="blue-gray"
            size="sm" disabled={currentPage === Math.ceil(tableData.length / rowsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}