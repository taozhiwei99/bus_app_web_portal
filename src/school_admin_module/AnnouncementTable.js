import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  Typography, 
  Tooltip, 
  IconButton,
} from "@material-tailwind/react";
import { 
  CButton,
  CModal,
  CForm,
  CFormInput, 
  CFormLabel,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
} from "@coreui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import CIcon from '@coreui/icons-react';
import { cilPencil } from "@coreui/icons";
import '../css/defaultstyle.css';

export default function AnnouncementTable() {  
  // VIEW ANNOUNCEMENTS START //
  const TABLE_HEAD = ["ANNOUNCEMENT ID", "MESSAGE", "POSTED BY", "DATE POSTED","LAST UPDATED", "", ""];

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getschoolannouncement', { schadmid: localStorage.getItem('userid') })
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);

  // View announcement modal
  const [ viewModalVisible, setViewModalVisible ] = useState(false);
  const [ viewMessage, setViewMessage ] = useState('');

  const handleViewAnnouncement = ( message ) => {
    setViewMessage(message);
    setViewModalVisible(true);
  };

  // VIEW ANNOUNCEMENTS END //



  // CREATE FUNCTION START //
  // Hook to toggle visibility of create announcement modal
  const [visible, setVisible] = useState(false)

  // Hooks which will save the inputs in the create announcement modal,
  // The inputs will then be submitted to the post request API later
  const [message, setMessage] = useState('');

  // Get today's date, then format it to the correct format for MySQL (YYYY-MM-DD)
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().toLocaleString();

  // Method to clear the create announcement inputs
  const handleClearForm = () => {
    setMessage('');
  };

  // Create announcement in database
  const handleCreateAnnouncement = async () => {
    try {
      // validation check if empty
      if (!message.trim()) {
        alert('Announcement message is empty! Write your message before posting')
        return;
      }

      const userid = localStorage.getItem('userid')

      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-createannouncement', 
      { message, formattedCurrentDate, userid });

      const apiresult = res.data;
      if (apiresult.success) {
        alert('Announcement successfully created')
        handleClearForm();
        setVisible(false);
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
  // Variables that will be used in the update modal
  const [ updateModalVisible, setUpdateModalVisible ] = useState(false);
  const [ annId, setAnnId ] = useState('');
  const [ updateMessage, setUpdateMessage ] = useState('');

  // Hook to toggle visibility of update modal,
  // The update modal will be populated with selected row's announcement message
  const showUpdateModal = ( annid, message ) => {
    setAnnId(annid);
    setUpdateMessage(message);
    setUpdateModalVisible(true);
  };

  // Update announcement in DB
  const handleUpdateAnnouncement = async () => {
    try {
      // validation check if message changed
      const rowData = tableData.find(data => data.ann_ID === annId);
      const isUpdated = updateMessage !== rowData.message;
      if (!isUpdated) {
        alert('No changes made. Change the message first before updating');
        return;
      }

      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-updateannouncement', {
        annid: annId, 
        updatemessage: updateMessage, 
        formattedCurrentDate: formattedCurrentDate,
      });
  
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Announcement message successfully updated');
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
  const [deletingAnnId, setDeletingAnnId] = useState('');   

  const showDeleteConfirmation = (annid) => {
    setDeleteModalVisible(true);
    setDeletingAnnId(annid);
  };

  // Handle the deletion of an announcement
  const handleDeleteAnnouncement = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deleteannouncement', { data: { deletingAnnId } });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Announcement successfully deleted');
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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          School Announcements
        </p>

        {/* Create announcement button */}
        <CButton 
          onClick={() => setVisible(!visible)}
          style={{
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-5 py-2" >
          Create Announcement
        </CButton>

        {/* Create announcement modal */}
        <CModal scrollable visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Announcement</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Announcement message</CFormLabel>
              <CFormTextarea
                rows={15}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Date</CFormLabel>
              <CFormInput 
                value={formattedCurrentDate} 
                className='mb-2'
                disabled
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateAnnouncement}>
              Post
            </CButton>
          </CModalFooter>
        </CModal>
      </div>

      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {tableData.length === 0 ? (
            <Typography className="p-4">No announcement posted</Typography>
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
                {tableData.map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                  return (
                    <tr key={data.ann_ID}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.ann_ID}
                        </Typography>
                      </td>
                      <td className={classes}>    
                        <Typography 
                          variant="small" 
                          color="blue-gray" 
                          className="font-normal w-screen h-32 overflow-hidden"
                          onClick={() => handleViewAnnouncement(data.message)}>
                          {data.message}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.schAdmin_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.datePosted}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.lastUpdated}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.ann_ID, data.message)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.ann_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* View announcement modal */}
                <CModal 
                  backdrop='static' 
                  scrollable 
                  visible={viewModalVisible} 
                  onClose={() => setViewModalVisible(false)}>
                <CModalHeader>
                  <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                    Announcement
                  </CModalTitle>
                </CModalHeader>
                <CModalBody>
                  <CForm>
                    <CFormLabel>Announcement message:</CFormLabel>
                    <CFormTextarea
                      rows={15}
                      value={viewMessage}
                      className="mb-2"
                    />
                  </CForm>
                </CModalBody>
                </CModal>

                {/* Update announcement message modal */}
                <CModal backdrop='static' scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Announcement
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CForm>
                      <CFormLabel>Announcement message:</CFormLabel>
                      <CFormTextarea
                        rows={15}
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        className="mb-2"
                      />
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateAnnouncement}>
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
                    <p>Are you sure you want to delete this announcement?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteAnnouncement} color="light">
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
  );
}