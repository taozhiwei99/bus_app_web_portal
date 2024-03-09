import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSchool,
  cilContact,
  cilTouchApp,
  cilBusAlt,
  cilWindowMaximize,
  cilGroup,
  cilTags,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _navSystemAdmin = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/system-admin/dashboard',
    icon: <CIcon icon={cilWindowMaximize} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Subscribers',
    to: '/system-admin/managesubscribers',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },


  // ASSIGNMENTS
  {
    component: CNavTitle,
    name: 'Assignments',
  },
  {
    component: CNavItem,
    name: 'School-Vendor',
    to: '/system-admin/schoolvendorassignment',
    icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
  },


  // PICKUP RECORDS
  {
    component: CNavTitle,
    name: 'Pickup records',
  },
  {
    component: CNavItem,
    name: 'Self pickups',
    to: '/system-admin/selfpickuprecords',
    icon: <CIcon icon={cilTouchApp} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Vehicle pickups',
    to: '/system-admin/vehiclepickuprecords',
    icon: <CIcon icon={cilBusAlt} customClassName="nav-icon" />,
  },


  // ACCOUNTS
  {
    component: CNavTitle,
    name: 'Accounts',
  },
  {
    component: CNavItem,
    name: 'School',
    to: '/system-admin/school',
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Vendor',
    to: '/system-admin/vendor',
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
  },
]

export default _navSystemAdmin