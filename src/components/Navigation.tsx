
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarMenu } from '@/components/ui/sidebar';
import { NavigationItem } from './navigation/NavigationItem';
import { useAuth } from '@/contexts/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { getMenuItemsByRole } from '@/config/menuItems';

const STORAGE_KEY = 'batchly-sidebar-expanded';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isDevMode, devRole } = useDevMode();
  const { user } = useAuth();
  
  // Get menu items based on the active role (dev role in dev mode, or user role)
  const role = isDevMode ? devRole : (user?.role || 'customer_service');
  const menuItems = getMenuItemsByRole(role);
  
  console.log('[Navigation] Rendering with:', { 
    isDevMode, 
    devRole,
    userRole: user?.role,
    activeRole: role,
    menuItemsCount: menuItems?.length || 0,
    currentPath: location.pathname,
    expandedItems
  });
  
  // Auto-expand the current section based on the URL path
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const currentMainPath = '/' + location.pathname.split('/')[1];
      
      // Find the matching menu item for the current path
      const matchingItem = menuItems.find(item => 
        item.path === currentMainPath || 
        location.pathname.startsWith(item.path)
      );
      
      if (matchingItem && !expandedItems.includes(matchingItem.title)) {
        console.log(`[Navigation] Auto-expanding ${matchingItem.title} based on URL path`);
        setExpandedItems(prev => [...prev, matchingItem.title]);
      }
    }
  }, [location.pathname, menuItems, expandedItems]);
  
  // Load expanded state from localStorage on mount
  useEffect(() => {
    try {
      const savedExpanded = localStorage.getItem(STORAGE_KEY);
      if (savedExpanded) {
        const parsed = JSON.parse(savedExpanded);
        if (Array.isArray(parsed)) {
          setExpandedItems(parsed);
        }
      }
    } catch (e) {
      console.error('[Navigation] Failed to parse saved sidebar state', e);
    }
  }, []);

  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
    } catch (e) {
      console.error('[Navigation] Failed to save sidebar state', e);
    }
  }, [expandedItems]);

  const isActive = (path: string): boolean => {
    console.log(`[Navigation] Checking if ${path} is active for current path ${location.pathname}`);
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const toggleExpand = (title: string) => {
    console.log(`[Navigation] Toggling expansion for ${title}`);
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };
  
  // Default to dashboard if no menu items are available
  useEffect(() => {
    if ((!menuItems || menuItems.length === 0) && location.pathname !== '/' && user) {
      console.warn('[Navigation] No menu items available for this role - redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [menuItems, navigate, location.pathname, user]);
  
  if (!menuItems || menuItems.length === 0) {
    return (
      <SidebarMenu>
        <div className="p-4 text-sm text-gray-500">
          No menu items available. Please check permissions.
        </div>
      </SidebarMenu>
    );
  }
  
  return (
    <SidebarMenu>
      {menuItems.map((menuItem) => {
        // Add 'id' property to each menu item if it's missing
        const item = menuItem.id ? menuItem : { ...menuItem, id: menuItem.title };
        
        return (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={isActive(item.path)}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
          />
        );
      })}
    </SidebarMenu>
  );
};
