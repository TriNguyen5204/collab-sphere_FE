import apiClient from "../../../services/apiClient";

export const getPagesByWhiteboardId = async whiteboardId => {
  try {
    const response = await apiClient.get(`/whiteboards/${whiteboardId}/pages`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching pages for whiteboard ${whiteboardId}:`,
      error
    );
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
      `/pages/${pageId}?NewPageTitle=${encodeURIComponent(newPageTitle)}` // or { title: newPageTitle } depending on your backend DTO
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating page ${pageId}:`, error);
    throw error;
  }
};
export const deletePage = async pageId => {
  try {
    const response = await apiClient.delete(`/pages/${pageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting page ${pageId}:`, error);
    throw error;
  }
};
export const getShapesByPageId = async pageId => {
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
export const parseShapeJson = shapeObj => {
  try {
    // Check if shapeObj exists
    if (!shapeObj) {
      throw new Error('Shape object is null or undefined');
    }

    // ✅ CRITICAL FIX: Backend returns "jsonData" not "jsonDate"!
    if (!shapeObj.jsonData) {
      console.warn('⚠️ Shape has no jsonData property:', shapeObj);
      throw new Error('Shape jsonData is missing');
    }

    // Check if jsonData is already an object (not a string)
    if (typeof shapeObj.jsonData === 'object') {
      console.log('ℹ️ jsonData is already an object, returning as-is');
      return shapeObj.jsonData;
    }

    // Check if jsonData is undefined or null string
    if (shapeObj.jsonData === 'undefined' || shapeObj.jsonData === 'null') {
      throw new Error(`Invalid jsonData value: "${shapeObj.jsonData}"`);
    }

    // Parse the JSON string
    const parsed = JSON.parse(shapeObj.jsonData);

    if (!parsed) {
      throw new Error('Parsed result is null or undefined');
    }

    console.log('✅ Successfully parsed shape:', parsed.id);
    return parsed;
  } catch (error) {
    console.error('❌ Error parsing shape JSON:', error);
    console.error('❌ Shape object:', shapeObj);
    console.error('❌ jsonData value:', shapeObj?.jsonData);
    console.error('❌ jsonData type:', typeof shapeObj?.jsonData);
    throw error;
  }
};
export const formatShapesForApi = shapes => {
  return shapes.map(shape => ({
    ...shape,
    jsonData: typeof shape === 'string' ? shape : JSON.stringify(shape),
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
