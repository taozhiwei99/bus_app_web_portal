// NPM INSTALLS //
// npm install body-parser
// npm install cors
// npm install express
// npm install mysql
// npm install serverless-http

// PRE REQUISITES //
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
app.use(cors());

// DB CONNECTION //
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'schoolpickup.c5zxh3qsi4iy.ap-southeast-1.rds.amazonaws.com',
  user: 'root',
  password: 'schoolpickup',
  database: 'schoolPickUp',
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection error", err);
    return;
  }
  console.log("Connected to the database");
  connection.release();
});



// Validation query, used when creating any user accounts
// Expecting a single ID in paramater
const SELECT_USERID_QUERY = ` 
  SELECT sysAdmin_ID FROM system_admin WHERE sysAdmin_ID = ?
  UNION SELECT school_ID FROM school WHERE school_ID = ?
  UNION SELECT schAdmin_ID FROM school_admin WHERE schAdmin_ID = ?
  UNION SELECT teacher_ID FROM teacher WHERE teacher_ID = ?
  UNION SELECT parent_ID FROM parent WHERE parent_ID = ?
  UNION SELECT child_ID FROM child WHERE child_ID = ?
  UNION SELECT vendor_ID FROM vendor WHERE vendor_ID = ?
  UNION SELECT driver_ID FROM driver WHERE driver_ID = ?`;
  
// Expecting array of IDs in parameter
const SELECT_USERID_QUERY_FORARRAY = ` 
  SELECT sysAdmin_ID FROM system_admin WHERE sysAdmin_ID IN (?)
  UNION SELECT school_ID FROM school WHERE school_ID IN (?)
  UNION SELECT schAdmin_ID FROM school_admin WHERE schAdmin_ID IN (?)
  UNION SELECT teacher_ID FROM teacher WHERE teacher_ID IN (?)
  UNION SELECT parent_ID FROM parent WHERE parent_ID IN (?)
  UNION SELECT child_ID FROM child WHERE child_ID IN (?)
  UNION SELECT vendor_ID FROM vendor WHERE vendor_ID IN (?)
  UNION SELECT driver_ID FROM driver WHERE driver_ID IN (?)`;





// COMMON INTERFACE //
// Login page web app
app.post('/api/weblogin', (req, res) => {
  const { userid, password, usertype } = req.body;

  // Filter for user type
  if (usertype === 'sys-adm') {
    db.query('SELECT * FROM system_admin WHERE sysAdmin_ID = ?', [userid], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length > 0) {
        // Retrieve the password
        // Compare the stored password with the incoming password using localeCompare
        const storedPassword = results[0].password;
        
        if (storedPassword.localeCompare(password) === 0) {
          // Retrieve their first and last names, imageURI
          const { firstName, lastName, imageURI } = results[0];
          res.json({ success: true, userid, usertype, firstName, lastName, imageURI });
        } else {
          res.json({ success: false });
        }
      } else {
        res.json({ success: false });
      }
    });
  } else if (usertype === 'sch-adm') {
    db.query('SELECT * FROM school_admin WHERE schAdmin_ID = ?', [userid], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length > 0) {
        // Retrieve the stored password
        // Compare the stored password with the incoming password using localeCompare
        const storedPassword = results[0].password;

        if (storedPassword.localeCompare(password) === 0) {
          // Retrieve their first and last names, imageURI, and school ID
          const { firstName, lastName, imageURI, school_ID } = results[0];
          res.json({ success: true, userid, usertype, firstName, lastName, imageURI, school_ID });
        } else {
          res.json({ success: false });
        }
      } else {
        res.json({ success: false });
      }
    });
  } else if (usertype === 'ven') {
    db.query('SELECT * FROM vendor WHERE vendor_ID = ?', [userid], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length > 0) {
        // Retrieve the stored password
        // Compare the stored password with the incoming password using localeCompare
        const storedPassword = results[0].password;

        if (storedPassword.localeCompare(password) === 0) {
          // Retrieve their company name, imageURI, and school ID
          const { vendor_Name, imageURI, school_ID } = results[0];
          res.json({ success: true, userid, usertype, vendor_Name, imageURI, school_ID });
        } else {
          res.json({ success: false });
        }
      } else {
        res.json({ success: false });
      }
    });
  } else {
    // Handle unknown user type
    res.status(400).json({ error: 'Invalid user type' });
  }
});

// During login for vendors, get all school_IDs that are associated with the vendor
app.get('/api/ven-getassociatedschools/:vendorid', (req, res) => {
  const vendorid = req.params.vendorid;
  
  db.query('SELECT school_ID FROM school_vendor WHERE vendor_ID = ?', [ vendorid ], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    // Extract only the school_ID values from the result objects and create an array of strings
    const schoolIdsArray = results.map(item => item.school_ID);
    res.json(schoolIdsArray);
  });
});

// User click on edit profile icon
app.post('/api/webgetprofiledetails', (req, res) => {
  const { type, id } = req.body;
  
  if (type === 'sys-adm') {
    db.query('SELECT * FROM system_admin WHERE sysAdmin_ID = ?', [ id ], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length > 0) {
        // Retrieve account details we want
        const { firstName, lastName, email, password } = results[0];
        res.json({ success: true, id, firstName, lastName, email, password});
      } else {
        res.json({ success: false });
      }
    });
  } else if (type === 'sch-adm') {
      db.query('SELECT * FROM school_admin WHERE schAdmin_ID = ?', [ id ], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          res.status(500).json({ error: 'An error occurred' });
          return;
        }
        if (results.length > 0) {
          // Retrieve account details we want
          const { firstName, lastName, email, password } = results[0];
          res.json({ success: true, id, firstName, lastName, email, password});
        } else {
          res.json({ success: false });
        }
      });
    } else if (type === 'ven') {
        db.query('SELECT * FROM vendor WHERE vendor_ID = ?', [ id ], (err, results) => {
          if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'An error occurred' });
            return;
          }
          if (results.length > 0) {
            // Retrieve account details we want
            const { vendor_Name, address, email, password } = results[0];
            res.json({ success: true, id, vendor_Name, address, email, password});
          } else {
            res.json({ success: false });
          }
        });    
      } else {
          res.status(400).json({ error: 'Invalid user type' });
        }
});

// Updating user profile details
app.put('/api/webeditprofiledetails', (req, res) => {
  const { type, id, editedFirstName, editedLastName, editedEmail } = req.body;
  
  if (type === "sys-adm") {
    db.query('UPDATE system_admin SET firstName = ?, lastName = ?, email = ? WHERE sysAdmin_ID = ?', [editedFirstName, editedLastName, editedEmail, id], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed to update' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    });
  } else if (type === "sch-adm") {
    db.query('UPDATE school_admin SET firstName = ?, lastName = ?, email = ? WHERE schAdmin_ID = ?', [editedFirstName, editedLastName, editedEmail, id], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed to update' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

// Changing user's password
app.put('/api/webchangepassword', (req, res) => {
  const { type, id, pw } = req.body;
  
  if (type === "sys-adm") {
    db.query('UPDATE system_admin SET password = ? WHERE sysAdmin_ID = ?', [pw, id], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed to update' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    });
  } else if (type === "sch-adm") {
    db.query('UPDATE school_admin SET password = ? WHERE schAdmin_ID = ?', [pw,id], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed to update' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    });
  } else if (type === "ven") {
    db.query('UPDATE vendor SET password = ? WHERE vendor_ID = ?', [pw,id], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed to update' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    });  
    
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

// User uploading profile picture
app.put('/api/web-uploadprofilepicture', (req, res) => {
  const { uri, ui, ut } = req.body;
  
  // Determine which account to upload to based on user's type
  if (ut == 'sys-adm') {
    db.query('SELECT * FROM system_admin WHERE sysAdmin_ID = ?', [ ui ], (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        if (results.length > 0) {
          db.query('UPDATE system_admin SET imageURI = ? WHERE sysAdmin_ID = ?', [ uri, ui ], (err, results) => {
            if (err) {
              res.json({ success: false, errlog: 'Query error 2' });
            } else {
              res.json({ success: true, uri});
            }
          });
        }
      }
    });
  } else if (ut == 'sch-adm') {
    db.query('SELECT * FROM school_admin WHERE schAdmin_ID = ?', [ ui ], (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        if (results.length > 0) {
          db.query('UPDATE school_admin SET imageURI = ? WHERE schAdmin_ID = ?', [ uri, ui ], (err, results) => {
            if (err) {
              res.json({ success: false, errlog: 'Query error 2' });
            } else {
              res.json({ success: true, uri});
            }
          });
        }
      }
    });
  } else if (ut == 'ven') {
    db.query('SELECT * FROM vendor WHERE vendor_ID = ?', [ ui ], (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        if (results.length > 0) {
          db.query('UPDATE vendor SET imageURI = ? WHERE vendor_ID = ?', [ uri, ui ], (err, results) => {
            if (err) {
              res.json({ success: false, errlog: 'Query error 2' });
            } else {
              res.json({ success: true, uri});
            }
          });
        }
      }
    });
  } else {
    res.json({success: false, errlog:"Invalid user type"});
  }
});






// SCHOOL ADMIN INTERFACE //
// School admin announcement tab - get school announcements
app.post('/api/schadm-getschoolannouncement', (req, res) => {
  const { schadmid } = req.body;

  // Retrieve the school ID of this admin
  const getSchoolIDQuery = `
    SELECT school_ID
    FROM school_admin
    WHERE schAdmin_ID = ?
  `;

  // With the school ID, we now retrieve all the school admin IDs associated with this school
  const getAllAssociatedAdminIDsQuery = `
    SELECT schAdmin_ID
    FROM school_admin
    WHERE school_ID = (${getSchoolIDQuery})
  `;

  // Now with all the associated school admin IDs, we select all the announcement posts that are posted by these school admin IDs
  const getAllAnnouncementsQuery = `
    SELECT a.ann_ID, a.message, a.schAdmin_ID, a.datePosted, a.lastUpdated
    FROM announcement AS a
    WHERE a.schAdmin_ID IN (${getAllAssociatedAdminIDsQuery})
    ORDER BY a.lastUpdated DESC
  `;

  db.query(getAllAnnouncementsQuery, [schadmid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.json(results);
  });
});

// School admin announcement tab - create announcement
app.post('/api/schadm-createannouncement', (req, res) => {
  const { message, formattedCurrentDate, userid } = req.body;
  
  db.query('INSERT INTO announcement (message, datePosted, lastUpdated, schAdmin_ID) VALUES (?, ?, ?, ?)',
    [message, formattedCurrentDate, formattedCurrentDate, userid ], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed insert' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    }
  );
});

// School admin announcement tab - update announcement
app.put('/api/schadm-updateannouncement', (req, res) => {
  const { annid, updatemessage, formattedCurrentDate } = req.body;

  db.query('UPDATE announcement SET message = ?, lastUpdated = ? WHERE ann_ID = ?', [ updatemessage, formattedCurrentDate, annid ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// School admin announcement tab - delete announcement
app.delete('/api/schadm-deleteannouncement', (req, res) => {
  const { deletingAnnId } = req.body;

  db.query('DELETE FROM announcement WHERE ann_ID = ?', [ deletingAnnId  ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin schedule tab - get schedules
app.get('/api/schadm-getschedule/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;

  db.query('SELECT * FROM schedules WHERE school_ID = ?',[ schoolid ], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// School admin schedule tab - delete schedule
app.delete('/api/schadm-deleteschedule', (req, res) => {
  const id = parseInt(req.body.id);

  db.query('DELETE FROM schedules WHERE schedule_ID = ?', [ id ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin schedule tab - upload schedule pdf
app.post('/api/schadm-uploadschedule', (req, res) => {
  const { sd, sy, uri, userid, schoolid } = req.body;

  db.query('INSERT INTO schedules (description, year, imageURI, schAdmin_ID, school_ID) VALUES (?, ?, ?, ?, ?)',
    [ sd , sy , uri, userid, schoolid], (err, results) => {
      if (err) {
        console.error(err);
        res.json({ success: false, errlog: 'Query error, failed insert' });
      } else {
        res.json({ success: true, errlog: 'NIL' });
      }
    }
  );
});

// School admin assignment tab - view  gate assignments
// #1 - Find all gates associated with the school
// #2 - Find all teachers associated with the school
// #3- Find all gate assignments associated with the teachers (through their school id)
app.get('/api/schadm-getschoolgates/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM school_gate WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.get('/api/schadm-getteachers/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM teacher WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.get('/api/schadm-getgateassignments/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM gate_assignment WHERE teacher_ID IN (SELECT teacher_ID FROM teacher WHERE school_ID = ?)', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// School admin assignment tab - assign teacher
app.post('/api/schadm-creategateassignment', (req, res) => {
  const { gateid, teacherid, formattedDatetime } = req.body;

  // Trim the formattedDatetime to only include the date part (year, month, and day)
  const trimmedDate = formattedDatetime.split('T')[0];

  // Check if there are any records with the same gateid, teacherid, and trimmed date in the database
  db.query(
    'SELECT * FROM gate_assignment WHERE gate_ID = ? AND teacher_ID = ? AND DATE(datetime) = ?',
    [gateid, teacherid, trimmedDate],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      // Check if there are any matching records in the database
      if (results.length > 0) {
        // There are existing records with the same gateid, teacherid, and date
        res.json({ success: false , hi: 'there are matching records' });
      } else {
        // Proceed with the assignment and insert into the database
        db.query(
          'INSERT INTO gate_assignment (gate_ID, teacher_ID, datetime) VALUES (?, ?, ?)',
          [gateid, teacherid, formattedDatetime],
          (err, results) => {
            if (err) {
              console.error('Database query error:', err);
              res.status(500).json({ error: 'An error occurred' });
              return;
            }
            // Assignment successful
            res.json({ success: true });
          }
        );
      }
    }
  );
});

// School admin assignment tab - delete gate assignment
app.post('/api/schadm-deletegateassignment', (req, res) => {
  const { dgi, dti, ddt } = req.body;
  db.query('DELETE FROM gate_assignment WHERE gate_ID = ? AND teacher_ID = ? AND datetime = ?', [dgi, dti, ddt], (err, results) => {
    if (err) {
      res.send({success: false, message: 'Delete query error'});
    } else {
      res.send({success: true, message: 'Successfully deleted'});
    }
  });
});

// School admin assignment tab - view teacher child assignments
//refer to app.get('/api/schadm-getteachers/:schoolid'

// School admin assignment tab - view teacher child assignment after user click on view button
app.get('/api/schadm-getteacherchildassignment/:selectedTeacherId', (req, res) => {
  const teacherid = req.params.selectedTeacherId;
  
  db.query('SELECT * FROM teacher_child WHERE teacher_ID = ?', [teacherid], (err, results) => {
    if (err) {
      res.send({success: false, errlog: 'Select query failed'});
    } else if (results.length > 0) {
      res.send({success: true, outcome: 1, r: results});
    } else if (results.length === 0) {
      res.send({success: true, outcome: 2, log: 'No teacher to child assignment record for this teacher in the database!'});
    }
  });
});

// School admin teacher tab - get teachers associated with school
//refer to /api/schadm-getteachers/:schoolid

// School admin teacher tab - update teacher account details
app.put('/api/schadm-updateteacher', (req, res) => {
  const { ui, ufn, uln, ue, ua, ucn, ufc  } = req.body;
  
  // Update the teacher account with the new values
  db.query('UPDATE teacher SET firstName = ?, lastName = ?, email = ?, address = ?, contactNo = ?, class_ID = ? WHERE teacher_ID = ?', [ ufn, uln, ue, ua, ucn, ufc, ui ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// School admin teacher tab - create new teacher account
app.post('/api/schadm-createteacher', (req, res) => {
  const { ui, p, fn, ln, e, a, cn, fc, si } = req.body;
  
  // Validation for if userid already exists among the 8 user tables
  db.query
  (SELECT_USERID_QUERY, [ ui, ui, ui, ui, ui, ui, ui, ui ], (err, results) => 
    {
      if (err) { 
        console.error(err);
        // Return false if error occured during select query
        res.json({success: false, errlog: 'Query error, failed select'});
      }
      if (results.length > 0) {
        // Return false if userid already exist
        res.json({success: false, errlog: 'Userid already exist'});
      } else {
        // Otherwise, proceed to create account
        db.query('INSERT INTO teacher (teacher_ID, password, firstName, lastName, email, address, contactNo, school_ID, class_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [ ui, p, fn, ln, e, a, cn, si, fc], (err, results) => {
          if (err) {
            console.error(err);
            // Return false if an error occurred during insert stmt
            res.json({success: false, errlog: 'Query error, failed insert'}); 
          } else {
            // Return true after successful insert
            res.json({success: true, errlog: 'NIL'}); 
          }
        });
      }
    }
  );
});

// School admin teacher tab - upload teacher accounts
// #1 Validate if userid already exist and check if classids submitted belongs to their school
// #2 Upload details to database
app.post('/api/schadm-uploadteachervalidation', (req, res) => {
  const { si, sti, sci } = req.body;
  
  // Validation, check if IDs are unique
  const uniqueSti = new Set(sti);
  if (uniqueSti.size !== sti.length) {
    res.send({ success: false, errlog: 'One or more teacherid you have submitted is duplicated. Please verify the teacher IDs in your csv' });
    return;
  }

  // Validation
  db.query(SELECT_USERID_QUERY_FORARRAY, [sti, sti, sti, sti, sti, sti, sti, sti], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Select query error 1' });
    } else if (results.length > 0) {
      res.send({ success: false, errlog: 'One or more userid you have submitted already exists' });
    } else {
      // Second check, fetch class_IDs associated with the school_ID (si)
      db.query('SELECT class_ID FROM form_class WHERE school_ID = ?', [si], (err, results) => {
        if (err) {
          res.send({ success: false, errlog: 'Select query error 2' });
        } else {
          // Convert fetched class_IDs to an array of strings
          const fetchedClassIds = results.map((row) => row.class_ID.toString());
          // Check if all submitted class_IDs belong to the same school
          const allBelongToSameSchool = sci.every((classId) => fetchedClassIds.includes(classId));
          
          if (allBelongToSameSchool) {
            res.send({ success: true, errlog: 'All validations passed' });
          } else {
            res.send({ success: false, errlog: 'One or mord class ID you have submitted is not associated with your school. Please verify all the class IDs in your csv file' });
          }
        }
      });
    }
  });
});

app.post('/api/schadm-uploadteacher', (req, res) => {
  const { data, si } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((teacher) => [
    teacher.teacherid,
    teacher.password,
    teacher.firstname,
    teacher.lastname,
    teacher.email,
    teacher.address,
    teacher.contactno,
    teacher.classid,
    si, // The school_ID is constant for all rows in the bulk insertion
  ]);

  // Execute the INSERT statement with bulk insertion values
  db.query(
    'INSERT INTO teacher (teacher_ID, password, firstName, lastName, email, address, contactNo, class_ID, school_ID) VALUES ?',
    [values],
    (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Teachers uploaded successfully' });
      }
    }
  );
});

// School admin teacher tab - delete teacher account
app.delete('/api/schadm-deleteteacher', (req, res) => {
  const { dui } = req.body;

  db.query('DELETE FROM teacher WHERE teacher_ID = ?', [ dui ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin child tab - view child accounts
// #1 Get all child in the school
// #2 Get class of the school
app.get('/api/schadm-getchild/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM child WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.get('/api/schadm-getclass/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM form_class WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

// School admin child tab - create new child account
app.post('/api/schadm-createchild', (req, res) => {
  const { ui, fn, ln, a , r, pi, fc, si } = req.body;
  
  // Validation for if userid already exists among the 8 user tables
  db.query
  (SELECT_USERID_QUERY, [ ui, ui, ui, ui, ui, ui, ui, ui ], (err, results) => 
    {
      if (err) { 
        console.error(err);
        // Return false if error occured during select query
        res.json({success: false, errlog: 'Query error, failed select'});
      }
      if (results.length > 0) {
        // Return false if userid already exist
        res.json({success: false, errlog: 'Userid already exist'});
      } else {
        // Otherwise, proceed to create account
        db.query('INSERT INTO child (child_ID, firstName, lastName, address, region, school_ID, parent_ID, class_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [ ui, fn, ln, a, r, si, pi, fc], (err, results) => {
          if (err) {
            console.error(err);
            res.json({success: false, errlog: 'Query error, failed insert'}); 
          } else {
            res.json({success: true, errlog: 'NIL'}); 
          }
        });
      }
    }
  );
});

// School admin child tab - upload child accounts
// #1 Validate if userid already exist and check if parentids and classids submitted belongs to their school
// #2 Upload details to database
app.post('/api/schadm-uploadchildvalidation', (req, res) => {
  const { si, scdi, spi, sci } = req.body;
  
  // Validation, check if IDs are unique
  const uniqueScdi = new Set(scdi);
  if (uniqueScdi.size !== scdi.length) {
    res.send({ success: false, errlog: 'One or more childid you have submitted is duplicated. Please verify the child IDs in your csv' });
    return;
  }

  // Validation
  db.query(SELECT_USERID_QUERY_FORARRAY, [scdi, scdi, scdi, scdi, scdi, scdi, scdi, scdi], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Select query error 1' });
    } else if (results.length > 0) {
      res.send({ success: false, errlog: 'One or more userid you have submitted already exists' });
    } else {
      // Validation, fetch class_IDs associated with the school_ID (si)
      db.query('SELECT class_ID FROM form_class WHERE school_ID = ?', [si], (err, results) => {
        if (err) {
          res.send({ success: false, errlog: 'Select query error 2' });
        } else {
          // Convert fetched class_IDs to an array of strings
          const fetchedClassIds = results.map((row) => row.class_ID.toString());
          // Check if all submitted class_IDs belong to the same school
          const allBelongToSameSchool = sci.every((classId) => fetchedClassIds.includes(classId));
          
          if (allBelongToSameSchool) {
            // Third check, fetch parent_IDs associated with the school_ID
            db.query('SELECT parent_ID FROM parent WHERE school_ID = ?', [si], (err, results) => {
              if (err) {
              res.send({ success: false, errlog: 'Select query error 2'});
              } else {
                const fetchedParentIds = results.map((row) => row.parent_ID.toString());
                const allBelongToSameSchool2 = spi.every((parentId) => fetchedParentIds.includes(parentId));
                
                if (allBelongToSameSchool2) {
                  res.send({ success: true, errlog: 'All validations passed' });
                } else {  
                  res.send({ success: false, errlog: 'One or more parent ID you have submitted is not associated with your school. Please verify all the parent IDs in your csv file' });
                }
              }
            });
          } else {
            res.send({ success: false, errlog: 'One or more class ID you have submitted is not associated with your school. Please verify all the class IDs in your csv file' });
          }
        }
      });
    }
  });
});

app.post('/api/schadm-uploadchild', (req, res) => {
  const { data, si } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((c) => [
    c.childid,
    c.firstname,
    c.lastname,
    c.address,
    c.region,
    c.parentid,
    c.classid,
    si,
  ]);

  // Execute the INSERT statement with bulk insertion values
  db.query(
    'INSERT INTO child (child_ID, firstName, lastName, address, region, parent_ID, class_ID, school_ID) VALUES ?',
    [values],
    (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Child details uploaded successfully' });
      }
    }
  );
});

// School admin child tab - update child account
app.put('/api/schadm-updatechild', (req, res) => {
  const { ui, ufn, uln, ua, ur, up, ufc  } = req.body;
  
  // Update account with the new values
  db.query('UPDATE child SET firstName = ?, lastName = ?, address = ?, region = ?, parent_ID = ?, class_ID =? WHERE child_ID = ?', [ufn, uln, ua, ur, up, ufc, ui], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// School admin child tab - delete child account
app.delete('/api/schadm-deletechild', (req, res) => {
  const { deletingUserId } = req.body;

  db.query('DELETE FROM child WHERE child_ID = ?', [ deletingUserId ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin parent tab - view parent accounts
app.get('/api/schadm-getparent/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM parent WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// School admin parent tab - create parent account
app.post('/api/schadm-createparent', (req, res) => {
  const { ui, p, fn, ln, e, cn, a, s, si } = req.body;
  
  // Validation for if userid already exists among the 8 user tables
  db.query
  (SELECT_USERID_QUERY, [ ui, ui, ui, ui, ui, ui, ui, ui ], (err, results) => 
    {
      if (err) { 
        console.error(err);
        // Return false if error occured during select query
        res.json({success: false, errlog: 'Query error, failed select'});
      }
      if (results.length > 0) {
        // Return false if userid already exist
        res.json({success: false, errlog: 'Userid already exist'});
      } else {
        // Otherwise, proceed to create account
        db.query('INSERT INTO parent (parent_ID, password, firstName, lastName, email, contactNo, address, subscription, school_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [ ui, p, fn, ln, e, cn, a, s, si ], (err, results) => {
          if (err) {
            console.error(err);
            res.json({success: false, errlog: 'Query error, failed insert'}); 
          } else {
            res.json({success: true, errlog: 'NIL'}); 
          }
        });
      }
    }
  );
});

// School admin parent tab - upload parent accounts
// #1 Validate if userid already exist
// #2 Upload details to database
app.post('/api/schadm-uploadparentvalidation', (req, res) => {
  const { spi } = req.body;
  
  // Validation, check if IDs are unique
  const uniqueSpi = new Set(spi);
  if (uniqueSpi.size !== spi.length) {
    res.send({ success: false, errlog: 'One or more parentid you have submitted is duplicated. Please verify the parent IDs in your csv' });
    return;
  }
  
  // Validation, check if IDs exists in DB
  db.query(SELECT_USERID_QUERY_FORARRAY, [spi, spi, spi, spi, spi, spi, spi, spi], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Select query error ' });
    } else if (results.length > 0) {
      res.send({ success: false, errlog: 'One or more userid you have submitted already exists' });
    } else {
      res.send({ success: true, errlog: 'All validations passed' });
    }
  });
});

app.post('/api/schadm-uploadparent', (req, res) => {
  const { data, s, si } = req.body;
  const iu = null;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((p) => [
    p.parentid,
    p.password,
    p.firstname,
    p.lastname,
    p.email,
    p.contactno,
    p.address,
    iu,
    s,
    si,
  ]);
  
  // Execute the INSERT statement with bulk insertion values
  db.query('INSERT INTO parent (parent_ID, password, firstName, lastName, email, contactNo, address, imageURI, subscription, school_ID) VALUES ?', [values], (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Parents uploaded successfully' });
      }
    }
  );
});

// School admin parent tab - update parent account details
app.put('/api/schadm-updateparent', (req, res) => {
  const { ui, ufn, uln, ue, ucn, ua  } = req.body;
  
  // Update account with the new values
  db.query('UPDATE parent SET firstName = ?, lastName = ?, email = ?, contactNo = ?, address = ? WHERE parent_ID = ?', [ ufn, uln, ue, ucn, ua, ui ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// School admin parent tab - delete parent account
app.delete('/api/schadm-deleteparent', (req, res) => {
  const { deletingUserId } = req.body;

  db.query('DELETE FROM parent WHERE parent_ID = ?', [ deletingUserId ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin class tab - view classes
// refer to app.get('/api/schadm-getclass/:schoolid'

// School admin class tab - create class
app.post('/api/schadm-createclass', (req, res) => {
  const { cn, si } = req.body;

  // Trim class name
  const cnTrim = cn.trim().replace(/\s+/g, '');
  if (!cnTrim) {
    res.json({ success: false, errlog: 'Class name cannot be empty after removing spaces.' });
    return;
  }

  // Check if either the original class name or the trimmed class name exists in their school
  db.query('SELECT class_Name FROM form_class WHERE (class_Name = ? OR class_Name = ?) AND school_ID = ?', [cn, cnTrim, si], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Error while checking class name existence.' });
    } else {
      if (results.length > 0) {
        // Class name already exists for the given school
        res.json({ success: false, errlog: 'Class name already exists for the school.' });
      } else {
        // Class name does not exist, proceed with creating the class
        db.query('INSERT INTO form_class (class_Name, school_ID) VALUES (?, ?)', [cn, si], (err, result) => {
          if (err) {
            console.error(err);
            res.json({ success: false, errlog: 'Error while creating class.' });
          } else {
            res.json({ success: true });
          }
        });
      }
    }
  });
});

// School admin class tab - upload class
app.post('/api/schadm-uploadclass', (req, res) => {
  const { data, si } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((c) => [
    c.classname,
    si,
  ]);

  // Execute the INSERT statement with bulk insertion values
  db.query('INSERT INTO form_class (class_Name, school_ID) VALUES ?', [values], (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Classes uploaded successfully' });
      }
    });
});


// School admin class tab - delete class
app.delete('/api/schadm-deleteclass', (req, res) => {
  const { deletingClassId } = req.body;

  db.query('DELETE FROM form_class WHERE class_ID = ?', [ deletingClassId ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin gate tab - view gates
app.get('/api/schadm-getgate/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;
  db.query('SELECT * FROM school_gate WHERE school_ID = ?', [schoolid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

// School admin gate tab - create gate
app.post('/api/schadm-creategate', (req, res) => {
  const { gn, c, si } = req.body;

  // Trim class name
  const gnTrim = gn.trim().replace(/\s+/g, '');
  if (!gnTrim) {
    res.status(400).json({ success: false, errlog: 'Gate name cannot be empty after removing spaces.' });
    return;
  }

  // Check if either the original gate name or the trimmed gate name exists in their school
  db.query('SELECT gate_Name FROM school_gate WHERE (gate_Name = ? OR gate_Name = ?) AND school_ID = ?', [gn, gnTrim, si], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Error while checking class name existence.' });
    } else {
      if (results.length > 0) {
        // Gate name already exists for the given school
        res.json({ success: false, errlog: 'Gate name already exists for the school.' });
      } else {
        // Gate name does not exist, proceed with creating
        db.query('INSERT INTO school_gate (gate_Name, capacity, school_ID) VALUES (?, ?, ?)', [gn, c, si], (err, result) => {
          if (err) {
            console.error(err);
            res.json({ success: false, errlog: 'Error while creating class.' });
          } else {
            res.json({ success: true });
          }
        });
      }
    }
  });
});

// School admin gate tab - upload gate
app.post('/api/schadm-uploadgate', (req, res) => {
  const { data, si } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((g) => [
    g.gatename,
    g.capacity,
    si,
  ]);

  // Execute the INSERT statement with bulk insertion values
  db.query(
    'INSERT INTO school_gate (gate_Name, capacity, school_ID) VALUES ?',
    [values],
    (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Gates uploaded successfully' });
      }
    }
  );
});

// School admin gate tab - delete gate
app.delete('/api/schadm-deletegate', (req, res) => {
  const { deletingGateId } = req.body;

  db.query('DELETE FROM school_gate WHERE gate_ID = ?', [ deletingGateId ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// School admin teacher-child tab - upload teacher child csv validation
app.post('/api/schadm-uploadteacherchildassignmentvalidation', (req, res) => {
  const { data, si } = req.body;
  
  // Validation #1 check if child IDs in csv file are unique
  const childIds = [];
  data.forEach((i) => {
    childIds.push(i.childid);
  });
  const childIdsSet = new Set();
  data.forEach((i) => {
    childIdsSet.add(i.childid);
  });
  const uniqueChildIds = Array.from(childIdsSet);
  if (childIds.length !== uniqueChildIds.length) {
    res.send({ success: false, errlog: 'Duplicate child IDs found in the CSV. Please ensure all child IDs are unique.' });
    return;
  } else {
    
    // Validation #2 check if child IDs submitted belong to the school
    db.query('SELECT * FROM child WHERE child_ID IN (?) AND school_ID = ?', [childIds, si], (err, results) => {
      if (err) {
        res.send({ success: false, errlog: 'Select query error' });
      } else if (results.length !== childIds.length) {
        res.send({ success: false, errlog: 'One or more child IDs submitted do not belong to the school. Please verify the child IDs in your CSV.' });
        return;
      } else {
        
        // Validation #3 check if teacher IDs submitted belong to the school
        // Since teacher IDs are able to be duplicated in the csv file, we do not have to check if they are unique like in the validation above
        // However, to do validation where we check if submitted array length == length in the teacher table, we have to 'create' the unique teacher IDs 
        //#1
        const teacherIdsSet = new Set();
        data.forEach((i) => {
          teacherIdsSet.add(i.teacherid);
        });
        const uniqueTeacherIds = Array.from(teacherIdsSet);
        db.query('SELECT * FROM teacher WHERE teacher_ID IN (?) AND school_ID = ?', [uniqueTeacherIds, si], (err, tRes) => {
          if (err) {
            res.send({ success: false, errlog: 'Select query error' });
          } else if (tRes.length !== uniqueTeacherIds.length) {
            res.send({ success: false, errlog: 'One or more teacher IDs submitted do not belong to the school. Please verify the teacher IDs in your CSV.' });
            return;
          } else {
            
            // Validation #4 check if teacher child assignment already exists in the teacher_child table
            let exist = false;
            for (const i of data) {
              db.query('SELECT * FROM teacher_child WHERE teacher_ID = ? AND child_ID =?', [i.teacherid, i.childid], (err, tRes) => {
                if (err) {
                  res.send({ success: false, errlog: 'Select query error' });
                } else if (tRes.length > 0) {
                  exist = true;
                  res.send({ success: false, errlog: 'One or more teacher-child assignment already exists in the database' });
                } else {
                  if (!exist) { 
                    res.send({ success: true, errlog: 'Validation successful' });
                  }
                }
              });
            }

          }
        });
      }
    });
  }
});

// School admin teacher-child tab - upload teacher child
app.post('/api/schadm-uploadteacherchildassignment', (req, res) => {
  const { data } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((row) => [
    row.teacherid,
    row.childid,
  ]);

  // Execute the INSERT statement with bulk insertion values
  db.query('INSERT INTO teacher_child (teacher_ID, child_ID) VALUES ?', [values], (err, results) => {
    if (err) {
      res.json({ success: false, errlog: 'Insert query error' });
    } else {
      res.json({ success: true, log: 'Teacher-child assignments uploaded successfully' });
    }
  });

});










// VENDOR INTERFACE
// Vendor assignment tab - view driver assignment
// #1 - Find all vehicles associated with the vendor
// #2 - Find all drivers associated with the vendor
// #3- Find all drivers assignments associated with the drivers (through their vendor id)
app.get('/api/ven-getvehicles/:vendorid', (req, res) => {
  const vendorid = req.params.vendorid;
  db.query('SELECT * FROM vehicle WHERE vendor_ID = ?', [vendorid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.get('/api/ven-getdrivers/:vendorid', (req, res) => {
  const vendorid = req.params.vendorid;
  db.query('SELECT * FROM driver WHERE vendor_ID = ?', [vendorid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.get('/api/ven-getvehicleassignments/:vendorid', (req, res) => {
  const vendorid = req.params.vendorid;
  db.query('SELECT * FROM vehicle_assignment WHERE driver_ID IN (SELECT driver_ID FROM driver WHERE vendor_ID = ?)', [vendorid], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// Vendor assignment tab - assign driver
app.post('/api/ven-createvehicleassignment', (req, res) => {
  const { vehicleid, driverid, formattedDatetime } = req.body;

  // Trim the formattedDatetime to only include the date part (year, month, and day)
  const trimmedDate = formattedDatetime.split('T')[0];

  // Check if there are any records with the same vehicleplate, driverid, and trimmed date in the database
  db.query('SELECT * FROM vehicle_assignment WHERE vehicle_Plate = ? AND driver_ID = ? AND DATE(datetime) = ?', [vehicleid, driverid, trimmedDate], (err, check1Res) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      // Check if there are any matching records in the database
      if (check1Res.length > 0) {
        // There are existing records with the same vehicleplate, driverid, and date
        res.json({ success: false , errlog: 'Assignment unsuccessful. Driver has already been assigned today' });
      } else {
        // Check if driver selected already has assignment today
        db.query('SELECT * FROM vehicle_assignment WHERE driver_ID = ? AND DATE(datetime) = ?', [driverid, trimmedDate], (err, check2Res) =>{
          if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'An error occurred' });
            return;
          } else if (check2Res.length > 0) {
            // Driver has already been assigned today
            res.json({ success: false , errlog: 'Assignment unsuccessful. Driver has already been assigned today' });
          } else {
            // Check if vehicle seleted has already been assigned
            db.query('SELECT * FROM vehicle_assignment WHERE vehicle_Plate = ? AND DATE(datetime) = ?', [vehicleid, trimmedDate], (err, check3Res) =>{
              if (err) {
                console.error('Database query error:', err);
                res.status(500).json({ error: 'An error occurred' });
                return;
              } else if (check3Res.length > 0) {
                // Vehicle has already been assigned today
                res.json({ success: false , errlog: 'Assignment unsuccessful. Vehicle has already been assigned today' });
              } else {
                // Proceed with the assignment and insert into the database
                db.query(
                  'INSERT INTO vehicle_assignment (vehicle_Plate, driver_ID, datetime) VALUES (?, ?, ?)',
                  [vehicleid, driverid, formattedDatetime],
                  (err, results) => {
                    if (err) {
                      console.error('Database query error:', err);
                      res.status(500).json({ error: 'An error occurred' });
                      return;
                    }
                    // Assignment successful
                    res.json({ success: true });
                  }
                );
              }
            });
          }
        });
      }
    }
  );
});

// Vendor driver tab - view drivers
// refer to app.get('/api/ven-getdrivers/:vendorid'

// Vendor driver tab - create driver account
app.post('/api/ven-createdriveraccount', (req, res) => {
  const { ui, pw, fn, ln, e, cn, a, l, vi } = req.body;
  
  // Validation for if userid already exists among the 8 user tables
  db.query
  (SELECT_USERID_QUERY, [ ui, ui, ui, ui, ui, ui, ui, ui ], (err, results) => 
    {  
      if (err) { 
        console.error(err);
        // Return false if error occured during select query
        res.json({success: false, errlog: 'Query error, failed select'});
      }
      if (results.length > 0) {
        // Return false if userid already exist
        res.json({success: false, errlog: 'Userid already exist'});
      } else {
        // Otherwise, proceed to create account in driver table
        db.query('INSERT INTO driver (driver_ID, password, firstName, lastName, email, contactNo, address, license, vendor_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [ ui, pw, fn, ln, e, cn, a, l, vi ], (err, results) => {
          if (err) {
            console.error(err);
            // Return false if an error occurred during insert stmt
            res.json({success: false, errlog: 'Query error, failed insert'}); 
          } else {
            // Return true after successful insert
            res.json({success: true, errlog: 'NIL'}); 
          }
        });
      }
    }
  );
});

// Vendor driver tab - upload driver accounts
// #1 Validate if userid already exist
// #2 Upload details to database
app.post('/api/ven-uploaddrivervalidation', (req, res) => {
  const { sdi, sl } = req.body;
  
  // Validation, check if IDs are unique
  const uniqueSdi = new Set(sdi);
  if (uniqueSdi.size !== sdi.length) {
    res.send({ success: false, errlog: 'One or more driverid you have submitted is duplicated. Please verify the driver IDs in your csv' });
    return;
  }

  // check for userid
  db.query(SELECT_USERID_QUERY_FORARRAY, [sdi, sdi, sdi, sdi, sdi, sdi, sdi, sdi], (err, uidresults) => {
    if (err) {
      res.send({ success: false, errlog: 'Select query error 1' });
    } else if (uidresults.length > 0) {
      res.send({ success: false, errlog: 'One or more userid you have submitted already exists' });
    } else {
      // check for license
      db.query('SELECT license FROM driver WHERE license IN (?)', [sl], (err, licenseresults) => {
        if (err) {
          res.send({ success: false, errlog: 'Select query error 2' });
        } else if (licenseresults.length > 0) {
          res.send({ success: false, errlog: 'One or more license you have submitted already exists' });
        } else {
          res.send({ success: true, errlog: 'All validations passed' });
        }
      });
    }
  });
});

app.post('/api/ven-uploaddriver', (req, res) => {
  const { data, vi } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((d) => [
    d.driverid,
    d.password,
    d.firstname,
    d.lastname,
    d.email,
    d.contactno,
    d.address,
    d.license,
    vi,
  ]); 

  // Execute the INSERT statement with bulk insertion values
  db.query(
    'INSERT INTO driver (driver_ID, password, firstName, lastName, email, contactNo, address, license, vendor_ID) VALUES ?',
    [values],
    (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Drivers uploaded successfully' });
      }
    }
  );
});

// Vendor driver tab - update driver account details
app.put('/api/ven-updatedriveraccount', (req, res) => {
  const { ui, ufn, uln, ue, ucn, ua, ul } = req.body;

  // Update the school admin account with the new values
  db.query('UPDATE driver SET firstName = ?, lastName = ?, email = ?, contactNo = ?, address = ?, license = ? WHERE driver_ID = ?', [ ufn, uln, ue, ucn, ua, ul, ui ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// Vendor driver tab - delete driver account
app.delete('/api/ven-deletedriveraccount', (req, res) => {
  const { deletingUserId } = req.body;

  db.query('DELETE FROM driver WHERE driver_ID = ?', [deletingUserId], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// Vendor vehicle tab - view vehicles
// refer to app.get('/api/ven-getvehicles/:vendorid'

// Vendor vehicle tab - create vehicle
app.post('/api/ven-createvehicle', (req, res) => {
  const { vp, vt, c, vi } = req.body;
  
  // Validation for if vehicleplate already exists
  db.query('SELECT * FROM vehicle WHERE vehicle_Plate = ?', [ vp ], (err, results) => {
    if (err) { 
      console.error(err);
      // Return false if error occured during select query
      res.json({success: false, errlog: 'Query error, failed select'});
    }
    if (results.length > 0) {
      // Return false if vehicleplate already exist
      res.json({success: false, errlog: 'Vehicle plate already exist'});
    } else {
      // Otherwise, proceed to create vehicle (insert statement)
      db.query('INSERT INTO vehicle (vehicle_Plate, vehicle_Type, capacity, vendor_ID) VALUES (?, ?, ?, ?)', 
        [ vp, vt, c, vi ], (err, results) => {
        if (err) {
          console.error(err);
          // Return false if an error occurred during insert stmt
          res.json({success: false, errlog: 'Query error, failed insert'}); 
        } else {
          // Return true after successful insert
          res.json({success: true, errlog: 'NIL'}); 
        }
      });
    }
  });
});

// Vendor vehicle tab - upload vehicle
// #1 Validate if vehicleplate already exist
// #2 Upload details to database
app.post('/api/ven-uploadvehiclevalidation', (req, res) => {
  const { svp } = req.body;
  
  // Validation, check if IDs are unique
  const uniqueSvp = new Set(svp);
  if (uniqueSvp.size !== svp.length) {
    res.send({ success: false, errlog: 'One or more vehiceplate you have submitted is duplicated. Please verify the vehicle plates in your csv' });
    return;
  }
  
  db.query('SELECT * FROM vehicle WHERE vehicle_Plate IN (?)', [svp], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Select query error 1' });
    } else if (results.length > 0) {
      res.send({ success: false, errlog: 'One or more vehicle plate you have submitted already exists' });
    } else {
      res.send({ success: true, errlog: 'All validations passed' });
    }
  });
});

app.post('/api/ven-uploadvehicle', (req, res) => {
  const { data, vi } = req.body;

  // Convert the data array into an array of arrays (values) for bulk insertion
  const values = data.map((v) => [
    v.vehicleplate,
    v.vehicletype,
    v.capacity,
    vi,
  ]); 

  // Execute the INSERT statement with bulk insertion values
  db.query(
    'INSERT INTO vehicle (vehicle_Plate, vehicle_Type, capacity, vendor_ID) VALUES ?',
    [values],
    (err, results) => {
      if (err) {
        res.json({ success: false, errlog: 'Query error' });
      } else {
        res.json({ success: true, log: 'Vehicles uploaded successfully' });
      }
    }
  );
});

// Vendor vehicle tab - update vehicle
app.put('/api/ven-updatevehicle', (req, res) => {
  const { vp, uvt, uc } = req.body;

  // Update the vehicle with the new values
  db.query('UPDATE vehicle SET vehicle_type = ?, capacity = ? WHERE vehicle_plate = ?', [ uvt, uc, vp ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// Vendor vehicle tab - delete vehicle
app.delete('/api/ven-deletevehicle', (req, res) => {
  const { deletingVehicleplate } = req.body;

  db.query('DELETE FROM vehicle WHERE vehicle_Plate = ?', [ deletingVehicleplate ], (err, results) => {
    if (err) {
      console.error(err);
      // Return false if an error occurred during deletion
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      // Return true after successful deletion
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// Vendor dashboard tab - view dashboard
app.get('/api/ven-getschooldetails/:schoolIds', (req, res) => {
  // Receive the comma-separated string of schoolIds from the URL params
  const schoolIdsString = req.params.schoolIds;
  const schoolIdsArray = schoolIdsString.split(',');

  // Db query to select all the schools and their details
  db.query('SELECT * FROM school WHERE school_ID IN (?)', [schoolIdsArray], (err, results) => {
    if (err) {
      console.error(err);
      res.send({ success: false, errlog: 'Query error, failed to get data.' });
    } else {
      // Send the selected school data back to the frontend
      res.send(results);
    }
  });
});

// Vendor dashboard tab - view vehicle pick up jobs for specific school
app.post('/api/ven-getvehiclepickupjobstimeslot1', (req, res) => {
  const { si, d, ts1 } = req.body;
  db.query('SELECT dropoff_Region, COUNT(*) AS capacity FROM vehiclepickup_jobs WHERE school_ID = ? AND timeslot = ? AND DATE(jobcreated) = ? GROUP BY dropoff_Region', [si, ts1, d], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Query error' });
    } else {
      res.send({success: true, r1: results});
    }
  });
});

app.post('/api/ven-getvehiclepickupjobstimeslot2', (req, res) => {
  const { si, d, ts2 } = req.body;
  db.query('SELECT dropoff_Region, COUNT(*) AS capacity FROM vehiclepickup_jobs WHERE school_ID = ? AND timeslot = ? AND DATE(jobcreated) = ? GROUP BY dropoff_Region', [si, ts2, d], (err, results) => {
    if (err) {
      res.send({ success: false, errlog: 'Query error' });
    } else {
      res.send({success: true, r2: results});
    }
  });
});

// Vendor assignment tab - Assign driver to pick up jobs
app.put('/api/ven-assignvehiclepickupjobs', (req, res) => {
  const { ssi, sr, st, dt1, dt2, sdi, svp, svc } = req.body;
  const parsedSvc = parseInt(svc, 10);  // used in LIMIT = ?

  // Validation
  // Before assigning driver to pick up jobs, we need to check if driver have already been assigned today
  db.query('SELECT * FROM vehiclepickup_jobs WHERE school_ID = ? AND driver_ID = ? AND DATE(jobcreated) = ?', [ssi, sdi, dt2], (err, results) => {
    if (err) { 
      res.send({success:false, message:'Select query error'});
    } else if (results.length > 0) {
      res.send({success: false, message:'Driver has already been assigned for today'});
    } else {
      //
      db.query('UPDATE vehiclepickup_jobs SET jobassigned = ?, vehicle_Plate = ?, driver_ID = ? WHERE school_ID = ? AND dropoff_Region = ? AND timeslot = ? AND DATE(jobcreated) = ? AND jobassigned is NULL LIMIT ?', [dt1, svp, sdi, ssi, sr, st, dt2, parsedSvc], (err, results) => {
        if (err) {
          console.error('Update query error:', err);
          res.status(500).send({ success: false, message: 'Update query error' });
        } else if (results.affectedRows > 0) {
          res.send({ success: true, message: 'Job updated successfully' });
        } else {
          res.send({ success: false, message: 'Job not found' });
        }
      });
      //
    }
  });
});

// Vendor assignment tab - get jobs remaining
app.post('/api/ven-getvehiclepickupjobsremaining', (req, res) => {
  const {ssi, sr, st, dt} = req.body;
  
  db.query('SELECT COUNT(*) AS jobsRemaining FROM vehiclepickup_jobs WHERE school_ID = ? AND timeslot = ? AND DATE(jobassigned) IS NULL AND DATE(jobcreated) = ? AND dropoff_Region = ? GROUP BY dropoff_Region', [ssi, st, dt, sr], (err, results) => {
    if (err) {
      res.send({success: false, message: "Select query error"});
    } else {
      const jobsRemaining = results.map((result) => result.jobsRemaining);
        res.send({ success: true, jobsRemaining: jobsRemaining[0] });
    }
  });
});














// SYSTEM ADMIN INTERFACE
// System admin school tab - view schools
app.get('/api/sysadm-getschool', (req, res) => {
  db.query('SELECT * FROM school', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// System admin school tab - create schools
app.post('/api/sysadm-createschool', (req, res) => {
  const { si, sn, a, cn, t } = req.body;
  
  // Check if schoolid already exist
  db.query(SELECT_USERID_QUERY, [ si, si, si, si, si, si, si, si], (err, results) => {
    if (err) {
      res.json({success: false, errlog: 'Query error'});
    } 
    if (results.length > 0) {
      res.json({success: false, errlog: 'School ID already exist'});
    } else {
      //
      db.query('INSERT INTO school (school_ID, school_Name, address, contactNo, type) VALUES (?, ?, ?, ?, ?)', [si, sn, a, cn, t], (err, results) => {
          if (err) {
            res.json({ success: false, errlog: 'Query error, failed insert' });
          } else {
            res.json({ success: true, errlog: 'NIL' });
          }
        }
      );
    }
  });
});

// System admin school tab - create schools with image
app.post('/api/sysadm-createschoolwithimage', (req, res) => {
  const { si, sn, a, cn, t, uri } = req.body;
  
    // Check if schoolid already exist
  db.query(SELECT_USERID_QUERY, [ si, si, si, si, si, si, si, si], (err, results) => {
    if (err) {
      res.json({success: false, errlog: 'Query error'});
    } 
    if (results.length > 0) {
      res.json({success: false, errlog: 'School ID already exist'});
    } else {
      // proceed to create school
      db.query('INSERT INTO school (school_ID, school_Name, address, contactNo, type, imageURI) VALUES (?, ?, ?, ?, ?, ?)',
        [si, sn, a, cn, t, uri], (err, results) => {
          if (err) {
            console.error(err);
            res.json({ success: false, errlog: 'Query error, failed insert' });
          } else {
            res.json({ success: true, errlog: 'NIL' });
          }
        }
      );      
    }
  });
});

// System admin school tab - delete school
app.delete('/api/sysadm-deleteschool', (req, res) => {
  const { deletingSchoolId } = req.body;

  // Validation
  // Check if there are associated records in the school_admin table
  db.query('SELECT COUNT(*) AS count FROM school_admin WHERE school_ID = ?', [deletingSchoolId], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error' }); 
    } else {
      const count = results[0].count;
      
      //  If the count is greater than 0, it means there are associated records in the school_admin table, so do not delete the school
      if (count > 0) {
        res.json({ success: false, errlog: 'Associated records exist in school admin table, please ensure there are no school admin account associated with the school first before deleting!' });
      } else {
        // No associated records, proceed with deleting the school
        db.query('DELETE FROM school WHERE school_ID = ?', [deletingSchoolId], (err, results) => {
          if (err) {
            console.error(err);
            // Return false if an error occurred during deletion
            res.json({ success: false, errlog: 'Query error, failed to delete' }); 
          } else {
            // Return true after successful deletion
            res.json({ success: true, errlog: 'NIL' }); 
          }
        });
      }
    }
  });
});

// System admin school tab - view school admins of school
app.get('/api/sysadm-getschooladmin/:schoolid', (req, res) => {
  const schoolid = req.params.schoolid;

  db.query('SELECT * FROM school_admin WHERE school_ID = ?',[ schoolid ], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

// System admin school tab - create school admin of school
app.post('/api/sysadm-createschooladmin', (req, res) => {
  const { ui, p, fn, ln, e, cn, a, si } = req.body;
  
  // Validation for if userid already exists among the 8 user tables
  db.query
  (SELECT_USERID_QUERY, [ ui, ui, ui, ui, ui, ui, ui, ui ], (err, results) => 
    {  
      if (err) { 
        console.error(err);
        // Return false if error occured during select query
        res.json({success: false, errlog: 'Query error, failed select'});
      }
      if (results.length > 0) {
        // Return false if userid already exist
        res.json({success: false, errlog: 'Userid already exist'});
      } else {
        // Otherwise, proceed to create account in school_admin table 
        db.query('INSERT INTO school_admin (schAdmin_ID, password, firstName, lastName, email, contactNo, address, school_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [ ui, p, fn, ln, e, cn, a, si ], (err, results) => {
          if (err) {
            console.error(err);
            res.json({success: false, errlog: 'Query error, failed insert'});
          } else {
            res.json({success: true, errlog: 'NIL'});
          }
        });
      }
    }
  );
});

// System admin school tab - update school admin of school
app.put('/api/sysadm-updateschooladmin', (req, res) => {
  const { ui, ufn, uln, ue, ucn, ua } = req.body;

  db.query('UPDATE school_admin SET firstName = ?, lastName = ?, email = ?, contactNo = ?, address = ? WHERE schAdmin_ID = ?', [ ufn, uln, ue, ucn, ua, ui ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed to update' });
    } else {
      res.json({ success: true, errlog: 'NIL' });
    }
  });
});

// System admin school tab - delete school admin of school
app.delete('/api/sysadm-deleteschooladmin', (req, res) => {
  const { deletingUserId } = req.body;
  db.query('DELETE FROM school_admin WHERE schAdmin_ID = ?', [ deletingUserId  ], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error, failed delete' }); 
    } else {
      res.json({ success: true, errlog: 'NIL' }); 
    }
  });
});

// System admin vendor tab - view vendors
// #1 Get all vendors
// #2 Find out the schools each vendors are associated with
app.get('/api/sysadm-getvendor', (req, res) => {
  db.query('SELECT * FROM vendor', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('results: ', results);
    res.json(results);
  });
});

app.post('/api/sysadm-getassociatedschoolsforeachvendor', (req, res) => {
  const vendorIDs = req.body.vendorIDs; // Retrieve vendorIDs from the request body

  db.query('SELECT vendor_ID, school_ID FROM school_vendor WHERE vendor_ID IN (?)', [vendorIDs], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    // Group the results by vendor_ID
    const groupedData = results.reduce((acc, item) => {
      const { vendor_ID, school_ID } = item;
      if (!acc[vendor_ID]) {
        // If the vendor_ID is not in the accumulator, initialize it with an array containing the school_ID
        acc[vendor_ID] = [school_ID];
      } else {
        // If the vendor_ID is already in the accumulator, push the school_ID to its array
        acc[vendor_ID].push(school_ID);
      }
      return acc;
    }, {});

    // Convert the grouped data into an array of objects
    const vendorSchoolPairs = Object.keys(groupedData).map((vendor_ID) => ({
      vendor_ID,
      school_ID: groupedData[vendor_ID],
    }));

    res.json(vendorSchoolPairs);
  });
});

// System admin vendor tab - delete vendor
app.delete('/api/sysadm-deletevendor', (req, res) => {
  const { deletingVendorId } = req.body;

  // Validation
  // Check if there are associated records in the driver table
  db.query('SELECT COUNT(*) AS count FROM driver WHERE vendor_ID = ?', [deletingVendorId], (err, results) => {
    if (err) {
      console.error(err);
      res.json({ success: false, errlog: 'Query error' }); 
    } else {
      const count = results[0].count;
      
      if (count > 0) {
        res.json({ success: false, errlog: 'Associated records exist in driver table, please ensure there are no driver account associated with the vendor first before deleting!' });
      } else {
        // No associated records, proceed with deleting the vendor
        db.query('DELETE FROM vendor WHERE vendor_ID = ?', [deletingVendorId], (err, results) => {
          if (err) {
            console.error(err);
            res.json({ success: false, errlog: 'Query error, failed to delete' }); 
          } else {
            res.json({ success: true, errlog: 'NIL' }); 
          }
        });
      }
    }
  });
});

// System admin vendor tab - view driver of vendor
//refer to app.get('/api/ven-getdrivers/:vendorid'

// System admin vendor tab - create driver of vendor
//refer to app.post('/api/ven-createdriveraccount'

// System admin vendor tab - update driver of vendor
//refer to app.put('/api/ven-updatedriveraccount'

// System admin vendor tab - delete driver of vendor
//refer to app.delete('/api/ven-deletedriveraccount'

// System admin vendor tab - create vendor
app.post('/api/sysadm-createvendor', (req, res) => {
  const { vi, p, vn, a, e, cn } = req.body;
  
  // Validation if userid exists
  db.query(SELECT_USERID_QUERY, [ vi, vi, vi, vi, vi, vi, vi, vi ], (err, results) => {
    if (err) {
      res.json({success: false, errlog: 'Query error'});
    } 
    if (results.length > 0) {
      // Return false if userid already exist
      res.json({success: false, errlog: 'UseridFEWF already exist'});
    } else {
    // proceed to create vendor
      db.query('INSERT INTO vendor (vendor_ID, password, vendor_Name, address, email, contactNo) VALUES (?, ?, ?, ?, ?, ?)', [vi, p, vn, a, e, cn], (err, results) => {
          if (err) {
            res.json({success: false, errlog: 'Insert query error'});
          } else {
            res.json({success: true, errlog: 'NIL'});
          }
      });
    }
  });
});

// System admin subscriber tab - Get all subscribers
app.get('/api/sysadm-getsubscribers', (req, res) => {
  db.query('SELECT * FROM parent WHERE subscription = ? ORDER BY school_ID', ['Premium'], (err, results) => {
    if (err) {
      res.send({sucess: false, message: 'Select query error'});
    } else {
      res.send({success: true, r: results});
    }
  });
});

// System admin subscriber tab - Remove subscriber / changing from Premium back to Normal
app.post('/api/sysadm-removesubscriber', (req, res) => {
  const { dpi } = req.body;
  db.query('UPDATE parent SET subscription = ? WHERE parent_ID =?', ['Normal', dpi], (err, results) => {
    if (err) {
      res.send({success: false, message: 'Failed updated query'});
    } else {
      res.send({success: true});
    }
  });
});

// System admin self pickups tab - Get all self pickup records 
app.get('/api/sysadm-getselfpickuprecords', (req, res) => {
  db.query('SELECT * FROM selfpickup_jobs ORDER BY jobcreated DESC', (err, results) => {
    if (err) {
      res.send({sucess: false, message: 'Select query error'});
    } else {
      res.send({success: true, r: results});
    }
  });
});

// System admin vehicle pickups tab - Get all vehicle pickup records 
app.get('/api/sysadm-getvehiclepickuprecords', (req, res) => {
  db.query('SELECT * FROM vehiclepickup_jobs ORDER BY jobcreated DESC', (err, results) => {
    if (err) {
      res.send({sucess: false, message: 'Select query error'});
    } else {
      res.send({success: true, r: results});
    }
  });
});

// System admin School-Vendor assignment tab - get all school and vendor assignment
app.get('/api/sysadm-getschoolvendorassignment', (req, res) => {
  db.query('SELECT vendor_ID, GROUP_CONCAT(school_ID) AS school_IDs FROM school_vendor GROUP BY vendor_ID ORDER BY vendor_ID ASC', (err, results) => {
    if (err) {
      res.send({sucess: false, message: 'Select query error'});
    } else {
      res.send({success: true, r: results});
    }
  });
});

// System admin School-Vendor assignment tab - assign vendor to school
app.post('/api/sysadm-assignschoolvendor', (req, res) => {
  const { svi, ssi } = req.body;
  
  // Check if the assignment already exists in DB first
  db.query('SELECT * FROM school_vendor WHERE vendor_ID = ? AND school_ID = ?', [svi, ssi], (err, validationRes) => {
    if (err) {
      res.send({sucess: false, message: 'Select query error'});
    } else if (validationRes.length > 0) {
      res.send({sucess: false, message: 'Assignment failed, school and vendor selected has already been assigned'});
    } else {
      // Proceed with assignment
      db.query('INSERT INTO school_vendor (vendor_ID, school_ID) VALUES (?, ?)', [svi, ssi], (err, insertRes) => {
        if (err) { 
          res.send({sucess: false, message: 'Insert query error'}); 
        } else {
          res.send({success: true, message: 'Assignment successful. Check the School-Vendor table'});
        }
      });
    }
  });
});

// System admin dashboard tab - Get subscriber count by each school
app.get('/api/sysadm-getsubscribercountbyschool', (req, res) => {
  db.query('SELECT school_ID, SUM(CASE WHEN subscription = ? THEN 1 ELSE 0 END) AS normal_count, SUM(CASE WHEN subscription = ? THEN 1 ELSE 0 END) AS premium_count FROM parent GROUP BY school_ID',['Normal', 'Premium'], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});


module.exports.handler = serverless(app);