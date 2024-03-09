import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  Typography, 
  Tooltip, 
  IconButton,
  CardFooter,
  Button,
  Input,
} from "@material-tailwind/react";
import { 
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import '../css/defaultstyle.css';
import { useNavigate } from 'react-router';

export default function SchoolSchedule() {
  // VIEW SCHEDULE START //
  const TABLE_HEAD = ["SCHEDULE ID", "SCHEDULE DESCRIPTION", "YEAR", "POSTED BY", "", ""];

  const [scheduleTable, setScheduleTable] = useState([]);
  const schoolid = localStorage.getItem('schoolid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getschedule/${schoolid}`)
      .then(res => {
        setScheduleTable(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  // VIEW SCHEDULE END //


  // DELETE FUNCTION START //
  const [ deleteModalVisible, setDeleteModalVisible ] = useState(false)
  const [ deleteScheduleId, setDeleteScheduleId ] = useState()

  const viewDeleteModal = ( scheduleid ) => {
    setDeleteScheduleId(parseInt(scheduleid))
    setDeleteModalVisible(true)
  }

  const handleDeleteSchedule = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deleteschedule', { data: { id: deleteScheduleId }  } )
      
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Schedule successfully deleted');
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch(err) {
      alert(err)
    }
  }
  // DELETE FUNCTION END //


  // NAVIGATE TO UPLOAD TEACHER UI
  const navigate = useNavigate(); 
  const navigateToUploadSchedule = async () => {
    navigate('/school-admin/uploadschedule')
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
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          School Schedule
        </p>
      
        {/* Upload schedule button */}
        <CButton 
          onClick={navigateToUploadSchedule}
          style={{
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-5 py-2" >
          Upload Schedule
        </CButton>
      </div>

      {/* Search box */}
      <div className='py-4'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search schedule description"
        />
      </div>

      {/* School Schedule Table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {scheduleTable.length === 0 ? (
            <Typography className="p-4">No schedule uploaded</Typography>
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
                {scheduleTable
                  .filter((row) => row.description.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={data.schedule_ID}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.schedule_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.description}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.year}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.schAdmin_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                      <a href={data.imageURI} target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-800">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          View schedule
                        </Typography>
                      </a>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => viewDeleteModal(data.schedule_ID)}>
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
                    <p>Are you sure you want to delete this schedule?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteSchedule} color="light">
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
            {Array.from(Array(Math.ceil(scheduleTable.length / rowsPerPage)).keys()).map((page) => (
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
            size="sm" disabled={currentPage === Math.ceil(scheduleTable.length / rowsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}