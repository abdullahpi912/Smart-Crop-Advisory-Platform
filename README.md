# Smart Crop Recommendation System

Individual Machine Learning Project — Innolift Ventures, Full Stack AI Developer Program (Crescent-Batch-1), Module 2 (Days 19–20).

## Problem Statement

Farmers often choose what to plant based on habit or guesswork rather than the actual condition of their soil and the local climate. This leads to lower yields and wasted resources (seed, water, fertilizer) when the chosen crop isn't well suited to the field.

This project builds a Machine Learning model that recommends the most suitable crop for a given plot of land, based on measurable soil nutrient levels and climate conditions. Given readings for nitrogen, phosphorus, potassium, temperature, humidity, soil pH, and rainfall, the model predicts which of 22 crops is the best fit — turning a decision that's usually intuition-based into one backed by data.

This model is the ML core of a larger 60-day capstone: later phases build a React form for farmers to enter this data (Phase 3) and a Flask/MySQL backend to serve predictions and store recommendation history (Phases 4–5).

## Machine Learning Problem Type

**Classification** — multi-class, 22 possible crop labels.

## Objective

Train a classifier that takes 7 soil/climate readings as input and outputs a recommended crop, evaluate it thoroughly, and save it as a `.pkl` file ready to be served by the backend built in later phases.

## Dataset Information

| Field | Detail |
|---|---|
| **Name** | Crop Recommendation Dataset |
| **Source** | [kaggle.com/datasets/atharvaingle/crop-recommendation-dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) |
| **Rows** | 2,200 |
| **Columns** | 8 (7 features + 1 target) |
| **Missing values** | None |
| **Target variable** | `label` — 22 crop classes (e.g. rice, maize, chickpea, banana, coffee, cotton, jute) |

**Feature columns:**

| Feature | Description | Unit / Range |
|---|---|---|
| `N` | Nitrogen content ratio in the soil | ratio, roughly 0–140 |
| `P` | Phosphorous content ratio in the soil | ratio, roughly 5–145 |
| `K` | Potassium content ratio in the soil | ratio, roughly 5–205 |
| `temperature` | Ambient temperature | °C, roughly 8–44 |
| `humidity` | Relative humidity | %, roughly 14–100 |
| `ph` | Soil pH value (acidity/alkalinity) | scale, roughly 3.5–10 |
| `rainfall` | Rainfall | mm, roughly 20–300 |

**Why this dataset:** it directly matches the assigned project (crop recommendation from soil & climate inputs), has no missing data, and was already explored and modeled across Days 11–15 of this internship — Decision Tree outperformed Logistic Regression and KNN on it (Day 12), and it was evaluated with a confusion matrix, weighted precision/recall/F1 (Day 14), and tuned with GridSearchCV/RandomizedSearchCV (Day 15).

## Project Objectives

1. Understand the dataset thoroughly (structure, feature meaning, class balance).
2. Preprocess the data (duplicate check; no scaling needed for tree-based models).
3. Train a classifier that predicts the best crop from soil/climate inputs.
4. Evaluate the model with multiple metrics, not just accuracy.
5. Save the trained model as a `.pkl` file.
6. Push the complete, organized project to GitHub.

## Technologies Used

- **Language:** Python 3
- **Data handling:** Pandas, NumPy
- **Modeling:** scikit-learn (`DecisionTreeClassifier`, `RandomForestClassifier`, `GridSearchCV`)
- **Visualization:** Matplotlib, Seaborn
- **Environment:** Jupyter Notebook / Google Colab
- **Model persistence:** `pickle` / `joblib`
- **Version control:** Git & GitHub

## Planned Workflow

1. **Data Preprocessing**
   - Load the dataset and check for duplicates
   - Confirm no missing values (already known to be clean)
   - No feature scaling required for tree-based models

2. **Exploratory Data Analysis**
   - Class distribution across the 22 crops
   - Feature correlation heatmap
   - Summary statistics per feature

3. **Feature Engineering**
   - Not required for v1 — all 7 features are already directly relevant, numeric, and interpretable

4. **Model Training**
   - Train/test split (80/20, `random_state=42`)
   - Primary model: Decision Tree Classifier
   - Comparison model: Random Forest Classifier
   - Hyperparameter tuning via `GridSearchCV`

5. **Model Evaluation**
   - Accuracy
   - Precision / Recall / F1 (`average="weighted"`, since this is multi-class)
   - Confusion matrix (22×22, to see per-crop performance)
   - 5-fold cross-validation to confirm the result isn't a lucky split

6. **Model Saving**
   - Save the best-performing model as `Model/crop_recommendation_model.pkl`

7. **Version Control**
   - Push the notebook, dataset reference, model, and this README to GitHub

## Evaluation Metrics

| Metric | Why it's used |
|---|---|
| Accuracy | Overall correctness across all 22 classes |
| Weighted Precision/Recall/F1 | Multi-class metric that accounts for any class imbalance |
| Confusion Matrix | Shows exactly which crops get confused with which |
| 5-Fold Cross-Validation | Confirms the model generalizes, not just memorizes one split |



