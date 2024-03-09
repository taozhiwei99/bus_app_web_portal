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
import VehicleCsvExample from '../assets/csv-examples/vehiclecsv.png'

export default function UploadVehicle() {
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
            // Check if all required values are present in the row
            const keys = Object.keys(d);
            const values = Object.values(d);
            const allValuesPresent = values.every((val) => val !== undefined && val !== "");  // check if value is either empty string or undefined
            
            // Only process rows that have complete values
            if (allValuesPresent) {
              column.push(keys);
              value.push(values);
            } else {
              rowsToRemove.push(index)
            }
          });

          rowsToRemove.reverse().forEach(index=>{
            result.data.splice(index,1)
          })
          setData(result.data);

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
      // Validation, check if user submitted csv file with correct headers 
      const expectedHeader = ['vehicleplate', 'vehicletype', 'capacity'];
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
      // Validation, check if the vehicleplate submitted already exists
      const submittedVehiclePlates = data.map((item) => item.vehicleplate);
      axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-uploadvehiclevalidation', {
        svp: submittedVehiclePlates,
      })
      .then(firstCheckRes => {
        if (firstCheckRes.data.success) {
          // Proceed to upload details into vehicle DB
          const vendorid = localStorage.getItem('userid')
          axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-uploadvehicle', {
            data: data,
            vi: vendorid,
          })
          .then(uploadRes=>{
            if (uploadRes.data.success) {
              alert('Vehicle details uploaded successfully. Check the Vehicle tab')
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
  // UPLOAD FUNCTION END //

  return (
    <>
      <CContainer 
        className='px-5 py-4 pb-5' 
        style={{ display: 'flex', flexDirection: 'column'}}>
        <h1 
          style={{ color: '#56844B', fontWeight: 'bold', marginBottom: '25px', fontSize: '20px'}}>
          Upload Vehicle Details
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
            Number of vehicle data registered after upload: {numberOfRows}
          </Typography>
        }

        <Typography className="px-5 pb-5">
          Notice: Any row(s) in the CSV that have empty values will be skipped 
        </Typography>

        <CardHeader color="blue-gray" className="pb-2">
          <img
            src={VehicleCsvExample}
            alt="Vehicle CSV sample image"
          />
        </CardHeader>
        
        {/* Preview table */}
        {tableVisible && (
        <div className='pt-5'>
          <Card className="h-full w-full overflow-scroll">
            <table className="w-full min-w-max table-auto text-left">
              <tbody>
                {data.map(({ vehicleplate, vehicletype, capacity }, index) => (
                  <tr key={vehicleplate} className="even:bg-blue-gray-50/50">
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {vehicleplate}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {vehicletype}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {capacity}
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