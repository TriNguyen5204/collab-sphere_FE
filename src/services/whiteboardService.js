import apiClient from "./apiClient";

export const getPagesByWhiteboardId = async (whiteboardId) => {
  try {
    const response = await apiClient.get(`/whiteboards/${whiteboardId}/pages`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pages for whiteboard ${whiteboardId}:`, error);
    throw error;
  }
};
export const createPage = async (whiteboardId, pageTitle) => {
  try {
    const response = await apiClient.post(
      `/whiteboards/${whiteboardId}/pages?PageTitle=${encodeURIComponent(pageTitle)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating page for whiteboard ${whiteboardId}:`, error);
    throw error;
  }
};
export const updatePageTitle = async (pageId, newPageTitle) => {
  try {
    const response = await apiClient.put(
      `/pages/${pageId}?NewPageTitle=${encodeURIComponent(newPageTitle) }` // or { title: newPageTitle } depending on your backend DTO
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating page ${pageId}:`, error);
    throw error;
  }
};
export const deletePage = async (pageId) => {
  try {
    const response = await apiClient.delete(`/pages/${pageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting page ${pageId}:`, error);
    throw error;
  }
};
export const getShapesByPageId = async (pageId) => {
  try {
    const response = await apiClient.get(`/pages/${pageId}/shapes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shapes for page ${pageId}:`, error);
    throw error;
  }
};
export const saveShapes = async (pageId, shapes) => {
  try {
    const response = await apiClient.post(`/pages/${pageId}/shapes`, {
      shapes,
    });
    return response.data;
  } catch (error) {
    console.error(`Error saving shapes for page ${pageId}:`, error);
    throw error;
  }
};
export const updateShapes = async (pageId, shapes) => {
  try {
    const response = await apiClient.put(`/pages/${pageId}/shapes`, {
      shapes,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating shapes for page ${pageId}:`, error);
    throw error;
  }
};
export const deleteShapes = async (pageId, shapeIds) => {
  try {
    const response = await apiClient.delete(`/pages/${pageId}/shapes`, {
      data: { shapeIds },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting shapes for page ${pageId}:`, error);
    throw error;
  }
};
export const parseShapeJson = (shapeObj) => {
  try {
    return JSON.parse(shapeObj.jsonDate);
  } catch (error) {
    console.error('Error parsing shape JSON:', error);
    throw error;
  }
};
export const formatShapesForApi = (shapes) => {
  return shapes.map((shape) => ({
    ...shape,
    jsonDate: typeof shape === 'string' ? shape : JSON.stringify(shape),
  }));
};
export default {
  // Pages
  getPagesByWhiteboardId,
  createPage,
  updatePageTitle,
  deletePage,
  
  // Shapes
  getShapesByPageId,
  saveShapes,
  updateShapes,
  deleteShapes,
  
  // Helpers
  parseShapeJson,
  formatShapesForApi,
};