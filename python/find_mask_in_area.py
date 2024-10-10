import cv2
import numpy as np
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamPredictor

import sys
import os
import tempfile
import json

def load_model(checkpoint_path: str, model_type: str = "vit_h"):
    """
    Load the SAM model.
    
    Args:
    - checkpoint_path (str): Path to the model checkpoint.
    - model_type (str): Type of the SAM model to use (e.g., 'vit_h', 'vit_l', 'vit_b').
    
    Returns:
    - predictor (SamPredictor): An instance of the SamPredictor initialized with the loaded model.
    """
    sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
    predictor = SamPredictor(sam)
    return predictor

def set_image(predictor: SamPredictor, image_path: str):
    """
    Load an image and set it in the predictor.
    
    Args:
    - predictor (SamPredictor): An instance of the SamPredictor.
    - image_path (str): Path to the input image.
    
    Returns:
    - image (numpy.ndarray): Loaded image.
    """
    image = cv2.imread(image_path)
    predictor.set_image(image)
    return image

def get_masks_in_bbox(predictor: SamPredictor, bbox: list):
    """
    Get masks within a specified bounding box.
    
    Args:
    - predictor (SamPredictor): An instance of the SamPredictor.
    - bbox (list): Bounding box coordinates [x_min, y_min, x_max, y_max].
    
    Returns:
    - masks (list): List of predicted masks.
    - scores (list): List of confidence scores for the masks.
    """
    bbox_array = np.array(bbox).reshape(1, 4)
    masks, scores, _ = predictor.predict(
        point_coords=None,
        point_labels=None,
        box=bbox_array[None, :], 
        multimask_output=True)
    return masks, scores

def visualize_masks(image: np.ndarray, masks: list, scores: list, bbox:list):
    """
    Visualize the predicted masks on the image.
    
    Args:
    - image (numpy.ndarray): Original input image.
    - masks (list): List of predicted masks.
    - scores (list): List of confidence scores for the masks.


    """

    x_min, y_min, x_max, y_max = bbox
    cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)

    for i, mask in enumerate(masks):
        plt.figure(figsize=(8, 8))
        plt.imshow(image)
        plt.imshow(mask, alpha=0.5, cmap='jet')  # Overlay mask on the image
        plt.title(f"Mask {i} - Score: {scores[i]:.2f}")
        plt.axis('off')
        plt.show()



def saveToTempDir(uniqueHash, masks, scores):
    def transparent(segmentaion, path):
        png_image = np.uint8(segmentaion * 255)
        alpha_channel = np.where(png_image == 0, 0, 255).astype(np.uint8)
        rgba_image = cv2.merge((png_image, png_image, png_image, alpha_channel))
        cv2.imwrite(path, rgba_image)

    def serialize_data(obj):
        # Check for NumPy types and convert them to standard Python types
        if isinstance(obj, (np.ndarray, list)):
            return obj.tolist()  # Convert numpy array or list to a standard list
        elif isinstance(obj, (np.int32, np.int64)):
            return int(obj)  # Convert NumPy int to standard int
        elif isinstance(obj, (np.float32, np.float64)):
            return float(obj)  # Convert NumPy float to standard float
        return obj  # Return the object as is if it's already serializable


    #make save dir location
    tempDirPath = tempfile.gettempdir()
    saveDirPath = os.path.join(tempDirPath, 'basic-gui', uniqueHash, 'possible-masks')
    if not os.path.isdir(saveDirPath):
        os.mkdir(saveDirPath)
        print("Created successfully")

    mask_metadata = {}



    for idx, (mask, score) in enumerate(zip(masks, scores)):
        file = f"foundMask{idx}.png"
        filePath = os.path.join(saveDirPath, file)
        transparent(mask, filePath)

        #bbox
        non_zero_pixels = np.argwhere(mask > 0)
        # Calculate the bounding box coordinates
        y_min, x_min = non_zero_pixels.min(axis=0)
        y_max, x_max = non_zero_pixels.max(axis=0)
        width = x_max - x_min
        height = y_max - y_min
        #set bounding box
        bbox = (x_min, y_min, width, height)

        #area
        area = np.sum(mask)

        mask_metadata[filePath] = {
            "name" : score,
            "filePath": os.path.join('possible-masks', file),
            "area": area,
            "bbox": bbox,
            "internal": []
        }

    json_file_path = os.path.join(saveDirPath, 'mask_metadata.json')
    with open(json_file_path, 'w') as json_file:
        json.dump(mask_metadata, json_file, indent=4, default=serialize_data)

    

    

def find_mask_in_area(imagePath, bbox, dirPath):
    # Paths and parameters
    checkpoint_path = "python\\checkpoints\\sam_vit_l_0b3195.pth"  # Path to your SAM model checkpoint
    bbox = [int(x) for x in bbox]
    # Load model
    predictor = load_model(checkpoint_path, model_type='vit_l')

    # Set image
    image = set_image(predictor, imagePath)

    # Get masks within the bounding box
    masks, scores = get_masks_in_bbox(predictor, bbox)
    print(type(masks))
    print(type(masks[0]))
    #masks, scores = get_masks_from_point(predictor, point)

    # Visualize results
    saveToTempDir(dirPath, masks, scores)
    #visualize_masks(image, masks, scores, bbox)

if __name__ == "__main__":
    imagePath = sys.argv[1]
    bbox = sys.argv[2].split(",")
    dirPath = sys.argv[3]

    find_mask_in_area(imagePath, bbox, dirPath)
