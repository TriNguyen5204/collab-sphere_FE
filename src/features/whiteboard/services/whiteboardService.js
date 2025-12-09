import apiClient from "../../../services/apiClient";

//whiteboard
export const getWhiteboardId = async (teamId) => {
  try{
    const response = await apiClient.get(`/whiteboards/team/${teamId}`)
    return response.data;
  }catch(error){
    console.log('Error fetching whiteboardId', error)
    throw error
  }
}
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
export const getShapesByPageId = async (pageId) => {
  try {
    // 1. Gọi API lấy dữ liệu thô (Raw Data)
    const response = await apiClient.get(`/pages/${pageId}/shapes`);
    
    // 2. Map qua từng phần tử để "giải phóng" jsonData
    const parsedShapes = response.data.shapes.map((item) => {
        try {
            // Kiểm tra nếu jsonData là string thì parse ra
            let shape = typeof item.jsonData === 'string' 
                ? JSON.parse(item.jsonData) 
                : item.jsonData;

            // ⚠️ QUAN TRỌNG: Đảm bảo parentId đúng format
            // Nếu database lưu pageId là 12, nhưng tldraw cần "page:12"
            // Đoạn json của bạn đã có "parentId": "page:12" là ĐÚNG rồi.
            // Nhưng để chắc ăn, hãy đảm bảo shape.parentId khớp với pageId hiện tại
            
            return shape;
        } catch (err) {
            console.error("Lỗi parse shape:", err);
            return null;
        }
    }).filter(item => item !== null); // Loại bỏ các item bị lỗi null

    return parsedShapes;
  } catch (error) {
    console.error(`Error fetching shapes for page ${pageId}:`, error);
    return []; // Trả về mảng rỗng để không crash app
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

  // Helpers
  formatShapesForApi,
};
