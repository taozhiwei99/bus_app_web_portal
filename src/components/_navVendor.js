import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilBusAlt,
  cilTask,
  cilWindowMaximize,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _navVendor = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/vendor/dashboard',
    icon: <CIcon icon={cilWindowMaximize} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Assignments',
    to: '/vendor/driverassignment',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },


  // ACCOUNTS
  {
    component: CNavTitle,
    name: 'Accounts',
  },
  {
    component: CNavItem,
    name: 'Driver',
    to: '/vendor/drivers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },


  // ADDITIONAL
  {
    component: CNavTitle,
    name: 'Additional',
  },
  {
    component: CNavItem,
    name: 'Vehicle',
    to: '/vendor/vehicletable',
    icon: <CIcon icon={cilBusAlt} customClassName="nav-icon" />,
  },
]

export default _navVendor