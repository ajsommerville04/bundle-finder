import sys
import os
import json
from PIL import Image
import numpy as np

def calculate_new_bbox(bboxes):
    """
    Given a list of bounding boxes, calculate the enclosing bounding box.
    """
    x_min = min([bbox[0] for bbox in bboxes])
    y_min = min([bbox[1] for bbox in bboxes])
    x_max = max([bbox[0] + bbox[2] for bbox in bboxes])  # x + width
    y_max = max([bbox[1] + bbox[3] for bbox in bboxes])  # y + height
    return [x_min, y_min, x_max - x_min, y_max - y_min]

# Assuming `masks` is a list of binary masks, where each mask is a 2D numpy array
def calculate_union_area(masks):
    # Create an empty mask of the same size as the others
    union_mask = np.zeros_like(masks[0], dtype=np.uint8)
    
    # Overlay each mask on top of the union mask using a logical OR operation
    for mask in masks:
        union_mask = np.logical_or(union_mask, mask)
    
    # Calculate the total area by summing up the "True" (1) values in the union_mask
    total_area = int(np.sum(union_mask))
    
    return total_area

def mergeMasks(keyList: list[str], jsonPath: str, location: str):
    # Load JSON file
    dirHash = os.path.dirname(jsonPath)
    with open(jsonPath, 'r') as f:
        data = json.load(f)

    # Get the masks to be merged from the keyList
    itemsToBeMerged = [data[location][key] for key in keyList]

    filePaths = [os.path.join(dirHash, m['filePath']) for m in itemsToBeMerged]

    bboxes = [item['bbox'] for item in itemsToBeMerged]
    
    
    # Open the first image as the base image
    base_image = Image.open(filePaths[0]).convert("RGBA")

    # Iterate over the rest of the images and merge them
    for png in filePaths[1:]:
        overlay = Image.open(png).convert("RGBA")
        base_image = Image.alpha_composite(base_image, overlay)

    # Calculate the new bounding box and area
    masks = [np.array(Image.open(file).convert('1')) for file in filePaths]
    new_bbox = calculate_new_bbox(bboxes)
    total_area = calculate_union_area(masks)

    # Save the new merged mask image
    mask_bin_folder = os.path.join(dirHash, 'mask-bin')
    new_file_name = f"{len([f for f in os.listdir(mask_bin_folder) if os.path.isfile(os.path.join(mask_bin_folder, f))])}.png"
    new_file_path = os.path.join(mask_bin_folder, new_file_name)
    base_image.save(new_file_path)

    # Create the new mask entry
    new_mask_key = f"merged_mask_{len(data[location])}" 
    new_mask = {
        'name': new_mask_key,
        'filePath': os.path.join("mask-bin", new_file_name),
        'area': total_area,
        'bbox': new_bbox,
        'internal': []
    }

    # Move the internal masks from the original masks into the new mask's 'internal' list
    for item in itemsToBeMerged:
        new_mask['internal'].append({
            'name': item['name'],
            'filePath': item['filePath'],
            'area': item['area'],
            'bbox': item['bbox']
        })
        new_mask['internal'].extend(item['internal'])  # Include their internal masks as well

    # Remove the old masks and update the data with the new merged mask
    for key in keyList:
        del data[location][key]
    
    data[location][new_mask_key] = new_mask

    # Write the updated JSON back to the file
    with open(jsonPath, 'w') as f:
        json.dump(data, f, indent=4)

    print(f"Merged masks saved to {new_file_path} and JSON file updated.")

if __name__ == '__main__':
    # Example test variables
    # Get arguments passed from JavaScript
    keyList = sys.argv[1].split(",")  # Pass as comma-separated string
    jsonPath = sys.argv[2]
    location = sys.argv[3]
    
    mergeMasks(keyList, jsonPath, location)