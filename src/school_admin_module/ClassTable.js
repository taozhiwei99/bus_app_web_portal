import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
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
import '../css/defaultstyle.css'
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  IconButton,
} from '@material-tailwind/react'
import { TrashIcon } from "@heroicons/react/24/solid"

export default function ClassTable() {
  // VIEW CLASS DATA START //
  const TABLE_HEAD = ["CLASS ID", "CLASS NAME", ""];

  const [classData, setClassData] = useState([]);
  const schoolid = localStorage.getItem('schoolid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getclass/${schoolid}`)
      .then(res=> {
        setClassData(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])
  // VIEW CLASS DATA END //

  // CREATE FUNCTION START //
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [className, setClassName] = useState('');

  const handleClearForm = () => {
    setClassName('');
  }

  const handleCreateClass = async () => {
    try {
      // Basic frontend validation first, before sending post request
      if (!className.trim()) {
        alert('Fill in class name first before creating')
        return;
      }
      // Else proceed with post request
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-createclass', { cn: className, si: schoolid });

      const apiresult = res.data;
      if (apiresult.success) {
        alert('Class successfully created')
        handleClearForm();
        setCreateModalVisible(false);
        window.location.reload();
      } else {
        alert(apiresult.errlog);
      }

    } catch (err) {
      console.error(err);
    }
  }
  // CREATE FUNCTION END //


  // DELETE FUNCTION START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState('');   

  const showDeleteConfirmation = (classid) => {
    setDeleteModalVisible(true);
    setDeletingClassId(classid);
  };

  // Handle the deletion of an child account
  const handleDeleteClass = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deleteclass', { data: { deletingClassId } });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Class successfully deleted');
        window.location.reload();
      } else {
        // View error
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
    }
  };
  // DELETE FUNCTION END //

  // NAVIGATE TO UPLOAD CLASS UI //
  const navigate = useNavigate();
  const navigateToUploadclass = async () => {
    navigate('/school-admin/uploadclass')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} 
          >
          Class
        </p>

        {/* Upload Class Details Button */}
        <CButton 
          onClick={navigateToUploadclass}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" 
        >
          Upload Class
        </CButton>
        
        {/* Create Class Button */}
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
            Create Class
          </CButton>
        </div>
      </div>

      {/* Create Child Account Modal */}
      <CModal scrollable visible={createModalVisible} onClose={() => setCreateModalVisible(false)} backdrop='static'>
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Class</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className='overflow-auto'>
            <CFormLabel>Creating class for school</CFormLabel>
            <CFormInput 
              value={schoolid} 
              className='mb-2'
              disabled
            />
            <CFormLabel>Class Name</CFormLabel>
            <CFormInput 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className='mb-2'
            />
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-center">
          <CButton 
            style ={{'background': '#56844B', width: '70%'}}
            onClick={handleCreateClass}
          >
            Create Class  
          </CButton>
        </CModalFooter>
        </CModal>
      
      {/* Class table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {classData.length === 0 ? (
            <Typography className="p-4">No class created</Typography>
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
                {classData
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={data.class_ID}>
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
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.class_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                  {/* Delete confirmation modal */}
                  <CModal scrollable visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Confirm Deletion
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <p>Are you sure you want to delete this class?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteClass} color="light">
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
      </Card>    
    </>
  )
}