import React from 'react';
import { CModal, CButton, CModalHeader, CModalTitle, CModalBody, CModalFooter} from '@coreui/react';

// https://coreui.io/react/docs/components/modal/
const ConfirmationModal = ({ visible, onClose, onConfirm, callingComponent }) => {
  
  if (callingComponent === 'SchoolTable') {
    return (
      // Modal for SchoolTable
      <CModal scrollable visible={visible} onClose={onClose} >   
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this school?</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={onConfirm} color="light">Confirm</CButton>
          <CButton onClick={onClose} color="secondary">Cancel</CButton>
        </CModalFooter>
      </CModal>
    );
  } else if (callingComponent === 'SchoolTableViewAdmins') {
    return (
      // Modal for SchoolTableViewAdmins
      <CModal scrollable visible={visible} onClose={onClose} >   
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this school admin?</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={onConfirm} color="light">Confirm</CButton>
          <CButton onClick={onClose} color="secondary">Cancel</CButton>
        </CModalFooter>
      </CModal>
    );
  } else if (callingComponent === 'VendorTable') {
    return (
      // Modal for VendorTable
      <CModal scrollable visible={visible} onClose={onClose} >   
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this vendor?</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={onConfirm} color="light">Confirm</CButton>
          <CButton onClick={onClose} color="secondary">Cancel</CButton>
        </CModalFooter>
      </CModal>
    );
  } else if (callingComponent === 'VendorTableViewDrivers') {
    return (
      // Modal for VendorTableViewDrivers
      <CModal scrollable visible={visible} onClose={onClose} >   
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this driver?</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={onConfirm} color="light">Confirm</CButton>
          <CButton onClick={onClose} color="secondary">Cancel</CButton>
        </CModalFooter>
      </CModal>
    );
  } else if (callingComponent === 'SubscriberTable') {
    return (
      <CModal scrollable visible={visible} onClose={onClose} >   
        <CModalHeader>
          <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to remove this subscriber?</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={onConfirm} color="light">Confirm</CButton>
          <CButton onClick={onClose} color="secondary">Cancel</CButton>
        </CModalFooter>
      </CModal>
    )
  }

  else {
    // Default fallback rendering
    return null;
  }
};

export default ConfirmationModal;