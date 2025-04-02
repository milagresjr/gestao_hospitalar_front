'use client'

import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FaBed,
  FaCalendarAlt,
  FaCapsules,
  FaFile,
  FaFileMedical,
  FaFlask,
  FaHospitalUser,
  FaList,
  FaProcedures,
  FaStethoscope,
  FaTh,
  FaUserCircle,
} from 'react-icons/fa'
import { useSidebar } from '../context/SidebarContext'
import { ChevronDownIcon, HorizontaLDots } from '../icons/index'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
  allowedRoles?: string[]
}

const getNavItems = (userType?: string): NavItem[] =>
  [
    {
      icon: <FaTh className="text-lg" />,
      name: 'Dashboard',
      path: '/',
      allowedRoles: ['admin', 'medico', 'enfermeiro'],
    },
    {
      icon: <FaCalendarAlt className="text-lg" />,
      name: 'Recepção',
      path: '/recepcao',
      allowedRoles: ['admin', 'enfermeiro', 'recepcionista'],
    },
    {
      icon: <FaUserCircle className="text-lg" />,
      name: 'Triagem',
      path: '/triagem',
      allowedRoles: ['admin', 'medico', 'enfermeiro'],
    },
    {
      icon: <FaStethoscope className="text-lg" />,
      name: 'Consultório',
      path: '/consultorio',
      allowedRoles: ['admin', 'medico'],
    },
    {
      icon: <FaFlask className="text-lg" />,
      name: 'Laboratório',
      allowedRoles: ['admin', 'medico', 'laboratorista'],
      subItems: [
        { name: 'Tipo de Exame', path: '/tipo-exame' },
        { name: 'Lançar Resultado de Exame', path: '/lancar-resultado-exame' },
      ],
    },
    // {
    //   icon: <FaFileMedical className="text-lg" />,
    //   name: 'Resultado de Exames',
    //   path: '/resultado-exame',
    //   allowedRoles: ['admin', 'medico', 'laboratorista'],
    // },
    {
      icon: <FaHospitalUser className="text-lg" />,
      name: 'Gestão de Internamento',
      path: '/gestao-internamento',
      allowedRoles: ['admin', 'medico', 'enfermeiro'],
    },
    {
      icon: <FaList className="text-lg" />,
      name: 'Consultas',
      path: '/consultas',
      allowedRoles: ['admin', 'medico', 'recepcionista'],
    },
    {
      name: 'Entidades',
      icon: <FaUserCircle className="text-lg" />,
      allowedRoles: ['admin'],
      subItems: [
        { name: 'Paciente', path: '/pacientes' },
        { name: 'Profissional de Saúde', path: '/profissional-saude' },
        { name: 'Utilizador', path: '/utilizador' },
      ],
    },
    {
      name: 'Itens de Internamento',
      icon: <FaBed className="text-lg" />,
      allowedRoles: ['admin'],
      subItems: [
        { name: 'Área Hospitalar', path: '/areas-hospital' },
        { name: 'Salas', path: '/salas' },
        { name: 'Camas', path: '/camas' },
      ],
    },
    {
      name: 'Cadastros Básico',
      icon: <FaFile className="text-lg" />,
      allowedRoles: ['admin'],
      subItems: [
        { name: 'Fármaco', path: '/farmacos' },
        { name: 'Tipo de Serviço', path: '/tipo-servicos' },
        { name: 'Tipo de Consultas', path: '/tipo-consultas' },
        { name: 'Especialidade', path: '/especialidades' },
      ],
    },
  ].filter(
    item =>
      !item.allowedRoles || (userType && item.allowedRoles.includes(userType))
  )

const othersItems: NavItem[] = []

const AppSidebar: React.FC = () => {
  const { user } = useAuthStore()
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const [navItems, setNavItems] = useState<NavItem[]>([])

  useEffect(() => {
    setNavItems(getNavItems(user?.tipo))
  }, [user?.tipo])

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: 'main' | 'others'
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav: NavItem, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={'menu-item-text'}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? 'rotate-180 text-brand-500'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={el => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map(subItem => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others'
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname])

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false
    ;['main', 'others'].forEach(menuType => {
      const items = menuType === 'main' ? navItems : othersItems
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              })
              submenuMatched = true
            }
          })
        }
      })
    })

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [pathname, isActive])

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight(prevHeights => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu(prevOpenSubmenu => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null
      }
      return { type: menuType, index }
    })
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
              ? 'w-[290px]'
              : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resto do JSX... */}
      <nav className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start'
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                'Menu'
              ) : (
                <HorizontaLDots />
              )}
            </h2>
            {renderMenuItems(navItems, 'main')}
          </div>
        </div>
      </nav>
    </aside>
  )
}

export default AppSidebar
