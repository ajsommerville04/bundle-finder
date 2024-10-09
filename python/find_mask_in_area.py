import cv2
import numpy as np
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamPredictor
import sys
import os

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

def get_masks_from_point(predictor: SamPredictor, point: list):
    """
    Get masks within a specified bounding box.
    
    Args:
    - predictor (SamPredictor): An instance of the SamPredictor.
    - bbox (list): Bounding box coordinates [x_min, y_min, x_max, y_max].
    
    Returns:
    - masks (list): List of predicted masks.
    - scores (list): List of confidence scores for the masks.
    """
    bbox_array = np.array(point)
    masks, scores, _ = predictor.predict(box=bbox_array, multimask_output=True)
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

def display_image_with_bbox(image_path: str, bbox: list):
    """
    Display the image with a bounding box drawn on it.
    
    Args:
    - image (numpy.ndarray): Original input image.
    - bbox (list): Bounding box coordinates [x_min, y_min, x_max, y_max].
    """
    image = cv2.imread(image_path)
    # Draw the bounding box on the image
    x_min, y_min, x_max, y_max = bbox
    cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)  # Draw the bounding box in blue

    # Display the image with the bounding box
    plt.figure(figsize=(8, 8))
    plt.imshow(image)
    plt.title("Image with Bounding Box")
    plt.axis('off')
    plt.show()

def find_mask_in_area(imagePath, bbox, dirPath):
    # Paths and parameters
    #temperory variables
    checkpoint_path = "python\\checkpoints\\sam_vit_l_0b3195.pth"  # Path to your SAM model checkpoint
    bbox = [int(x) for x in bbox]
    # Load model
    predictor = load_model(checkpoint_path, model_type='vit_l')

    # Set image
    image = set_image(predictor, imagePath)

    # Get masks within the bounding box
    masks, scores = get_masks_in_bbox(predictor, bbox)
    #masks, scores = get_masks_from_point(predictor, point)

    # Visualize results
    visualize_masks(image, masks, scores, bbox)

if __name__ == "__main__":
    imagePath = sys.argv[1]
    bbox = sys.argv[2].split(",")
    dirPath = sys.argv[3]

    find_mask_in_area(imagePath, bbox, dirPath)
