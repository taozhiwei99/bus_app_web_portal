import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  Typography, 
  Tooltip, 
  IconButton,
  Input,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import '../css/defaultstyle.css';
import ConfirmationModal from './ConfirmationModal';

export default function SubscriberTable() {
  // VIEW FUNCTION START //
  const TABLE_HEAD = ["PARENT ID", "NAME", "EMAIL", "CONTACT NO", "ADDRESS", "SCHOOL ID", ""];
  const [subscriberTable, setSubscriberTable] = useState([]);

  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getsubscribers')
      .then(res => {
        if (res.data.success) {
          setSubscriberTable(res.data.r)
        }
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  // VIEW FUNCTION END //

  // REMOVE SUBSCRIBER START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deletingParentId, setDeletingParentId] = useState('')

  const showDeleteConfirmation = (deletingparentid) => {
    setDeletingParentId(deletingparentid)
    setDeleteModalVisible(true)
  }

  const handleRemoveSubscriber = async () => {
    try {
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-removesubscriber', { 
        dpi: deletingParentId 
      });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Subscriber has been removed.');
        window.location.reload();
      } else {
        alert(apiResult.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
    }
  }
  // REMOVE SUBSCRIBER END //

  // Hooks for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;  // number of rows to display
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Hook for search
  const [searchQuery, setSearchQuery] = useState('');

  return(
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Subscriber Accounts Management
        </p>        
      </div>

      {/* Search box */}       
      <div className='py-4'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search parent / subscriber's ID"
        />
      </div>

      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
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
                {subscriberTable.length > 0 ? (
                  subscriberTable
                  .filter((row) => row.parent_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                  .map(( data, index ) => {
                    const isLast = index === data.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={data.parent_ID}>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.parent_ID}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.firstName} {data.lastName}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.email}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.contactNo}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.address}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.school_ID}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Tooltip content="Delete">
                            <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.parent_ID)}>
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="p-4 text-center">
                      No records found
                    </td>
                  </tr>
                )}

                {/* Delete confirmation modal */}
                <ConfirmationModal
                  visible={deleteModalVisible}
                  onClose={() => setDeleteModalVisible(false)}
                  onConfirm={handleRemoveSubscriber}
                  callingComponent="SubscriberTable"
                />
              </tbody>
          </table>
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
            {Array.from(Array(Math.ceil(subscriberTable.length / rowsPerPage)).keys()).map((page) => (
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
            size="sm" disabled={currentPage === Math.ceil(subscriberTable.length / rowsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}