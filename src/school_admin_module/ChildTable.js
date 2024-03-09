import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
  CFormSelect,
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

export default function ChildTable() {
  // VIEW FUNCTION START // 
  const TABLE_HEAD = ["CHILD ID", "FIRST NAME", "LAST NAME", "ADDRESS", "REGION", "PARENT", "CLASS ID", "CLASS NAME", "", ""];

  const [childData, setChildData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [combinedTable, setCombinedTable] = useState([]);
  const schoolid = localStorage.getItem('schoolid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getchild/${schoolid}`)
      .then(res => {
        setChildData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getclass/${schoolid}`)
      .then(res=> {
        setClassData(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [childData])

  useEffect(() => {
    // When both childData and classData are available, create the combined table
    if (childData.length > 0 && classData.length > 0) {
      const combined = childData.map((child) => {
        // Find the class object with matching class_ID in classData
        const classObj = classData.find((cls) => cls.class_ID === child.class_ID);

        // Return a new object with combined data
        return {
          ...child,
          class_Name: classObj ? classObj.class_Name : "N/A", // If class is not found, display "N/A"
        };
      });
      setCombinedTable(combined);
    }
  }, [childData, classData]);
  // VIEW FUNCTION END //


  // CREATE FUNCTION START //
  // Hook to toggle visibility of create child modal
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [parentData, setParentData] = useState([])
  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getparent/${schoolid}`)
      .then(res=> {
        setParentData(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [combinedTable])

  // Hooks which will save the inputs in the create child modal,
  // The inputs will then be submitted to the post request API later
  const [ userId, setUserId ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ region, setRegion ] = useState('');
  const [ parentId, setParentId ] = useState('');
  const [ formClass, setFormClass ] = useState('');  

  // Method to clear the create child inputs
  const handleClearForm = () => {
    setUserId('')
    setFirstName('')
    setLastName('')
    setAddress('')
    setRegion('')
    setParentId('')
    setFormClass('')
  };

  // Handle create child
  const handleCreateChild = async () => {
    try {
      // Basic frontend validation first, before sending post request
      if (!userId.trim() || !firstName.trim() || !lastName.trim() || !address.trim() || !region.trim() || !parentId.trim() || !formClass.trim()) {
        alert('Fill in all fields first before creating the account')
        return;
      }
      
      // Else proceed with post request
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-createchild', { ui: userId, fn: firstName, ln: lastName, a: address, r: region, pi: parentId, fc: formClass, si: schoolid});

      const apiresult = res.data;
      if (apiresult.success) {
        alert('Account successfully created')
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


  // UPDATE FUNCTION START //
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedFirstname, setUpdatedFirstname] = useState('');
  const [updatedLastname, setUpdatedLastname] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedRegion, setUpdatedRegion] = useState('');
  const [updatedParent, setUpdatedParent] = useState('');
  const [updatedFormclass, setUpdatedFormclass] = useState('');

  const showUpdateModal = ( userid, firstname, lastname, address, region, parentid, formclass ) => {
    setUserId(userid);
    setUpdatedFirstname(firstname);
    setUpdatedLastname(lastname);
    setUpdatedAddress(address);
    setUpdatedRegion(region);
    setUpdatedParent(parentid);
    setUpdatedFormclass(formclass);
    setUpdateModalVisible(true);
  };
  
  // Handle updating driver details
  const handleUpdateChild = async () => {
    try {
      // Perform basic validation
      // Check that atleast 1 of the inputs are different from table row 
      const rowData = childData.find(data => data.child_ID === userId);
      const isUpdated = (updatedFirstname !== rowData.firstName || updatedLastname !== rowData.lastName || updatedAddress !== rowData.address || updatedRegion !== rowData.region || updatedParent !== rowData.parent_ID || updatedFormclass !== rowData.class_ID);
      
      if (!isUpdated) {
        alert('No changes made. Change either the names, address, region, parent or form class first before updating!');
        return;
      }

      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-updatechild', { 
        ui: userId, ufn: updatedFirstname, uln: updatedLastname, ua: updatedAddress, ur: updatedRegion, up: updatedParent, ufc: updatedFormclass
      });
  
      // Handle the response
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Account successfully updated');
        setUpdateModalVisible(false);
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // UPDATE FUNCTION END  //


  // DELETE FUNCTION START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');   

  const showDeleteConfirmation = (userid) => {
    setDeleteModalVisible(true);
    setDeletingUserId(userid);
  };

  // Handle the deletion of an child account
  const handleDeleteChild = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deletechild', { data: { deletingUserId } });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Account successfully deleted');
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
  // DELETE FUNCTION END //

  // Navigate to upload child UI
  const navigate = useNavigate(); 
  const navigateToUploadChild = async () => {
    navigate('/school-admin/uploadchild')
  }

  // Hooks for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;  // number of rows to display
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
          Child User Accounts
        </p>

        {/* Upload Child Accounts Button */}
        <CButton 
          onClick={navigateToUploadChild}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" 
        >
          Upload Child
        </CButton>
        
        {/* Create Child Account Button */}
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
            Create Child
          </CButton>
        </div>

        {/* Create Child Account Modal */}
        <CModal scrollable visible={createModalVisible} onClose={() => setCreateModalVisible(false)} backdrop='static'>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Child Account</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Creating child account for school</CFormLabel>
              <CFormInput 
                value={schoolid} 
                className='mb-2'
                disabled
              />
              <CFormLabel>Child ID</CFormLabel>
              <CFormInput 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>First Name</CFormLabel>
              <CFormInput 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Last Name</CFormLabel>
              <CFormInput 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Address</CFormLabel>
              <CFormInput 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='mb-2'
              />
              <CFormLabel className='mb-2'>Region</CFormLabel>        
              <CFormSelect onChange={(e) => setRegion(e.target.value)}>
                <option value="">Select Region</option>
                <option value="North">North</option>
                <option value="West">West</option>
                <option value="East">East</option>
                <option value="South">South</option>
                <option value="Central">Central</option>
              </CFormSelect>
              <CFormLabel className='mb-2'>Parent</CFormLabel>        
              <CFormSelect onChange={(e) => setParentId(e.target.value)}>
                <option value="">Select Parent</option>
                {parentData.map((p) => (
                <option key={p.parent_ID} value={p.parent_ID}>
                ID: {p.parent_ID} | {p.firstName}{p.lastName}
                </option>
                ))}
              </CFormSelect>
              <CFormLabel className='mt-2'>Form Class</CFormLabel>        
              <CFormSelect onChange={(e) => setFormClass(e.target.value)}>
                <option value="">Select Form Class</option>
                {classData.map((c) => (
                <option key={c.class_ID} value={c.class_ID}>
                ID: {c.class_ID} | {c.class_Name}
                </option>
                ))}
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateChild}
            >
              Create Child Account  
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
          placeholder="Search child user ID"
        />
      </div>

      {/* Child Accounts Overview Table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {combinedTable.length === 0 ? (
            <Typography className="p-4">No child accounts</Typography>
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
                {combinedTable
                  .filter((row) => row.child_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={data.child_ID}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.child_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.firstName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.lastName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.address}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.region}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.parent_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.class_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.class_Name}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.child_ID, data.firstName, data.lastName, data.address, data.region, data.parent_ID, data.class_ID)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.child_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* Update child account modal */}
                <CModal scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)} backdrop='static'>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Child Account
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CForm className="overflow-auto">
                      <CFormLabel>User ID</CFormLabel>
                      <CFormInput 
                        value={userId} 
                        className="mb-2"
                        disabled 
                      />
                      <CFormLabel>First Name</CFormLabel>
                      <CFormInput
                        value={updatedFirstname}
                        onChange={(e) => setUpdatedFirstname(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Last Name</CFormLabel>
                      <CFormInput
                        value={updatedLastname}
                        onChange={(e) => setUpdatedLastname(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Address</CFormLabel>
                      <CFormInput
                        value={updatedAddress}
                        onChange={(e) => setUpdatedAddress(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel className='mt-2'>Region</CFormLabel>        
                      <CFormSelect onChange={(e) => setUpdatedRegion(e.target.value)}>
                        <option value={updatedRegion}>{updatedRegion}</option>
                        <option value="" disabled>--</option>
                        <option value="North">North</option>
                        <option value="West">West</option>
                        <option value="East">East</option>
                        <option value="South">South</option>
                        <option value="Central">Central</option>
                      </CFormSelect>
                      <CFormLabel className='mt-2'>Parent</CFormLabel>        
                      <CFormSelect onChange={(e) => setUpdatedParent(e.target.value)}>
                        <option value={updatedParent}>{updatedParent}</option>
                        <option value="" disabled>--</option>
                        {parentData.map((p) => (
                        <option key={p.parent_ID} value={p.parent_ID}>
                        ID: {p.parent_ID} | {p.firstName}{p.lastName}
                        </option>
                        ))}
                      </CFormSelect>
                      <CFormLabel className='mt-2'>Class</CFormLabel>        
                      <CFormSelect onChange={(e) => setUpdatedFormclass(e.target.value)}>
                        <option value={updatedFormclass}>ID: {updatedFormclass}</option>
                        <option value="" disabled>--</option>
                        {classData.map((c) => (
                        <option key={c.class_ID} value={c.class_ID}>
                        ID: {c.class_ID} | {c.class_Name}
                        </option>
                        ))}
                      </CFormSelect>
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateChild}>
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
                    <p>Are you sure you want to delete this account?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteChild} color="light">
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
            {Array.from(Array(Math.ceil(combinedTable.length / rowsPerPage)).keys()).map((page) => (
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
            size="sm" disabled={currentPage === Math.ceil(childData.length / rowsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}