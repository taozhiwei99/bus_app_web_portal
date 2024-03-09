import React from 'react'
import Papa from 'papaparse'
import {
  CButton,
  CContainer,
  CFormInput,
} from '@coreui/react'
import { useState } from 'react'
import { Card, CardHeader, Typography } from '@material-tailwind/react';
import '../css/defaultstyle.css'
import axios from 'axios';
import ChildCsvExample from '../assets/csv-examples/childcsv.png'

export default function UploadChild() {
  // PREVIEW START //
  const [tableVisible, setTableVisible] = useState(false)
  const handlePreview = () => {
    setTableVisible(!tableVisible)
  }
  // PREVIEW END //

  //  UPLOAD FUNCTION START  //
  // States to store csv data
  const [ data, setData ] = useState([]);
  const [ column, setColumn ] = useState([]);
  const [ value, setValue ] = useState([]);
  const [ numberOfRows, setNumberOfRows ] = useState('');

  const handleCSV = (e) => {
    Papa.parse(e.target.files[0], 
      {
        header: true,
        skipEmptyLines: true,
        complete: function(result) {
          const column = [];
          const value = [];
          const rowsToRemove = [];
          result.data.forEach((d, index) => {
            // Extract key value pairs
            const keys = Object.keys(d);
            const values = Object.values(d);
            // Check if the values in each row contains data (as no blanks allowed)
            const allValuesPresent = values.every((val) => val !== "" && val !== undefined);  
            
            // Only process rows that have complete values into the column and value arrays
            if (allValuesPresent) {
              column.push(keys);
              value.push(values);
            } else {
              // Push the index that have blank values into the rowsToRemove array, which is used for deleting/splicing later
              rowsToRemove.push(index);
            }
          });
          // Method to delete the rows with blank values
          rowsToRemove.reverse().forEach((index) => {
            result.data.splice(index, 1);
          });

          // After removing rows with blank values, set the data state
          setData(result.data);

          // To know what is the name of the columns submitted by user
          setColumn(column[0]);

          // To see number of rows uploaded
          setValue(value);
          setNumberOfRows(value.length) 
        }
      }
    )
  }

  const handleSubmit = async () => {
      if (data.length == 0) {
        alert('Upload csv file first')
      } else {
        // First validation, check if user submitted csv file with correct headers 
        const expectedHeader = ['childid', 'firstname', 'lastname', 'address', 'region', 'parentid', 'classid'];
        // check if correct number of headers
        if (column.length !== expectedHeader.length) {
          alert('CSV file has incorrect number of headers. Please check the columns');
          return;
        }
        // check if correct name for headers
        const isHeaderCorrect = column.every((col, index) => col === expectedHeader[index]);
        if (!isHeaderCorrect) {
          alert('CSV file has incorrect headers. Please check the column order and spellings.');
          return;
        }
        // Second validation
        // Validate, check if userid already exists
        // Validate, check if parentid belongs to school
        // Validate, check if classid belongs to their school
        const schoolid = localStorage.getItem('schoolid');
        const submittedChildIds = data.map((item) => item.childid);
        const submittedParentIds = data.map((item) => item.parentid);
        const submittedClassIds = data.map((item) => item.classid);

        axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-uploadchildvalidation', {
          si: schoolid,
          scdi: submittedChildIds,
          spi: submittedParentIds,
          sci: submittedClassIds,
        })
        .then(firstCheckRes=> {
          if(firstCheckRes.data.success) {
            // Passed validation, proceed to upload child details into DB
            axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-uploadchild', {
              data: data,
              si: schoolid
            })
            .then(uploadRes=>{
              if (uploadRes.data.success) {
                alert('Child details uploaded successfully. Check the Child tab')
              } else {
                alert(uploadRes.data.errlog)
              }
            })
          } else {
            alert(firstCheckRes.data.errlog)
          }
        })
      }
  }
  //  UPLOAD FUNCTION END //

  return (
    <>
      <CContainer 
        className='px-5 py-4 pb-5' 
        style={{ display: 'flex', flexDirection: 'column'}}>
        <h1 
          style={{ color: '#56844B', fontWeight: 'bold', marginBottom: '25px', fontSize: '20px'}}>
          Upload Child Details
        </h1>
        <CFormInput 
          type="file" 
          id="formFile"
          accept=".csv"
          onChange={handleCSV}
          className='w-50'/>

          <div style={{marginTop: '40px', display: 'flex', justifyContent: 'space-between'}} className='w-50'>
            <CButton 
              onClick={handlePreview}
              style ={{'background': '#56844B', width: '45%'}}
              >
              Preview
            </CButton>
            <CButton 
              onClick={handleSubmit}
              style ={{'background': '#56844B', width: '45%'}}
              >
              Submit
            </CButton>
          </div>
      </CContainer>

      <CContainer className='px-4 py-2 pb-5'>
        {data.length == 0 ? '' : 
          <Typography className="px-5">
            Number of child data registered after upload: {numberOfRows}
          </Typography>
        }

        <Typography className="px-5 pb-5">
          Notice: Any row(s) in the CSV that have empty values will be skipped 
        </Typography>

        <CardHeader color="blue-gray" className="pb-2">
          <img
            src={ChildCsvExample} 
            alt="Child CSV sample image"
          />
        </CardHeader>
        
        {/* Preview table */}
        {tableVisible && (
        <div className='pt-5'>
          <Card className="h-full w-full overflow-scroll">
            <table className="w-full min-w-max table-auto text-left">
              <tbody>
                {data.map(({ childid, firstname, lastname, address, region, parentid, classid }, index) => (
                  <tr key={childid} className="even:bg-blue-gray-50/50">
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {childid}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {firstname}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {lastname}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {address}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {region}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {parentid}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {classid}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        )}
      </CContainer>
    </>
  )
}