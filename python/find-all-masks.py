import numpy as np
import sys
import cv2
import os
import tifffile as tf
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry
import handle_masks
from datetime import datetime as dt


def add_features_to_dict(lst_dict):
    '''
    list of dictionaries

    add normalise orientation
    '''
    new_list = []
    for idx, dict in enumerate(lst_dict):
        area = dict['area']
        _, _, w, h = dict['bbox']
        
        #makes width the smallest
        if h < w:
            h, w = w, h
        aspect = w / h

        #find approximate rectangles
        boolean_mask = dict['segmentation']
        binary_mask = (boolean_mask.astype(np.uint8)) * 255
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        assert len(contours) == 1, f"{idx}, equals {len(contours)} should equal 1"

        contour = contours[0]
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        #print(f"area: {area} width: {w} height: {h} aspect-ratio: {aspect}")
        dict['features'] = [area, w, h, aspect, len(approx)]
        new_list.append(dict)
    
    return new_list

def check_masks_for_overlap(lst):
    # Check for overlap between each pair of masks
    cnt = 0
    visted = [False] * len(lst)
    combined_masks = []
    
    for i in range(len(lst)):
        if visted[i] == True:
            continue
        internal_masks = []
        new_mask = None
        for j in range(i + 1, len(lst)):  # Compare mask i with every subsequent mask j
            mask1 = lst[i]['segmentation']
            mask2 = lst[j]['segmentation']
            overlap = np.logical_and(mask1, mask2)
            if np.any(overlap):
                any_overlap = True
                
                
                iarea = lst[i]['area']
                jarea = lst[j]['area']
                
                number_of_overlap = np.sum(overlap)
                
                cnt +=1
                overlap_percentage = number_of_overlap/jarea * 100
                if overlap_percentage > 50:
                    visted[j] = True
                    if type(new_mask) != np.ndarray:
                        new_mask = mask1 | mask2
                    else:
                        new_mask = new_mask | mask2
                    internal_masks.append(lst[j])
                    

                    
                   
                    #print_mask(img, mask1, mask2)
        
        if type(new_mask) == np.ndarray:
            old_mask = [lst[i]['segmentation']]
            lst[i]['segmentation'] = new_mask
            lst[i]['old_mask'] = old_mask
            lst[i]['area'] = np.sum(new_mask)
            

        lst[i]['internal_masks'] = internal_masks
        combined_masks.append(lst[i])
    
    return combined_masks

def find_all_masks(IMG_PATH):
    print(f"{dt.now()}: Starting")      
    # Load the image in WebP format
    loaded_image = cv2.imread(IMG_PATH, cv2.IMREAD_UNCHANGED)
    loaded_image = cv2.cvtColor(loaded_image, cv2.COLOR_BGR2RGB)

    # Check if the image is loaded properly
    if loaded_image is not None:
        print(f"{dt.now()}: Image loaded successfully!")
        sys.stdout.flush()
    else:
        raise TypeError("Failed to load the image.")
    
    #need to make checkpoint folder
    sam = sam_model_registry["vit_l"](checkpoint="python\\checkpoints\\sam_vit_l_0b3195.pth")
    device = "cuda"
    sam.to(device=device)

    print(f"{dt.now()}: Masks Generating")
    sys.stdout.flush()
    mask_generator = SamAutomaticMaskGenerator(sam)
    masks = mask_generator.generate(loaded_image)


    # Save each mask as a separate image may not be sorted by area due to some changing

    print(f"{dt.now()}: Masks Generated")
    sys.stdout.flush()
    for mask in masks:
        segmentation_mask = mask['segmentation']
        
        only_largest, area = handle_masks.find_largest_area(segmentation_mask)
        
        if not np.array_equal(segmentation_mask, only_largest):
            
            mask['segmentation'] = only_largest
            mask['area'] = area
            non_zero_pixels = np.argwhere(only_largest > 0)

            # Calculate the bounding box coordinates
            y_min, x_min = non_zero_pixels.min(axis=0)
            y_max, x_max = non_zero_pixels.max(axis=0)

            width = x_max - x_min
            height = y_max - y_min

            #set bounding box
            mask['bbox'] = (x_min, y_min, width, height)


    print(f"{dt.now()}: Features added")
    sys.stdout.flush()
    resorted = sorted(masks, key=(lambda x: x['area']), reverse=True)
    print(f"{dt.now()}: sorted masks")
    sys.stdout.flush()

    combined_masks = check_masks_for_overlap(resorted)
    added_features = add_features_to_dict(combined_masks)

    mask_bin_path = os.path.join(os.path.dirname(IMG_PATH), 'mask-bin')
    print(os.path.dirname(IMG_PATH))
    print(mask_bin_path)
    os.mkdir(mask_bin_path)
    if os.path.isdir(mask_bin_path):
        print("Created successfully")
    else:
        print("Failed")

    for idx, mask_array in enumerate(combined_masks):
        file_path = os.path.join(mask_bin_path, f"{idx}.tiff")
        tf.imwrite(file_path, mask_array['segmentation'])

    features = [shape['features'] for shape in added_features]

    scaler = StandardScaler()
    normalized_features = scaler.fit_transform(features)

    # Apply K-means clustering
    k = 2  # Number of clusters
    weights = np.array([0.6, 0.24, 0.1, 0.05, 0.01])
    assert np.sum(weights) == 1, f"should equal 1 not {np.sum(weights)}"

    kmeans = KMeans(n_clusters=k, random_state=0)
    clusters = kmeans.fit_predict(normalized_features)

    print(f"{dt.now()}: Masks Split")
    sys.stdout.flush()

    #used for making json and orginising files
    grouped_shapes = [[] for _ in range(k)]
    for i, shape in enumerate(added_features):
        grouped_shapes[clusters[i]].append(shape)
    


    return grouped_shapes

if __name__ == '__main__':
    image_path = sys.argv[1]
    
    #add checks for type of image
    inside, outside = find_all_masks(image_path)

    



    
    