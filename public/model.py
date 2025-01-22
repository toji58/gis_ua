import json
from datasets import Dataset
from transformers import T5Tokenizer, T5ForConditionalGeneration
from transformers import Trainer, TrainingArguments

# Replace 'your_file_path.json' with the path to your dataset file
file_path = r'C:\Users\kirze\OneDrive\Desktop\firebase\public\dataset\history.json'
# Load your dataset from the JSON file
with open(file_path, 'r') as f:
    data = json.load(f)

# Convert the data into a Dataset
dataset = Dataset.from_dict({
    "question": [item["question"] for item in data],
    "answer": [item["answer"] for item in data]
})

# Load pre-trained T5 model and tokenizer
tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")

# Tokenize the dataset
def preprocess_function(examples):
    inputs = tokenizer(examples['question'], truncation=True, padding="max_length", max_length=512)
    outputs = tokenizer(examples['answer'], truncation=True, padding="max_length", max_length=512)
    inputs["labels"] = outputs["input_ids"]
    return inputs

# Apply the preprocessing function to the dataset
tokenized_dataset = dataset.map(preprocess_function, batched=True)

# Split the dataset into training and evaluation sets (e.g., 80% training, 20% evaluation)
train_dataset = tokenized_dataset.train_test_split(test_size=0.2)["train"]
eval_dataset = tokenized_dataset.train_test_split(test_size=0.2)["test"]

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",            # Output directory for model checkpoints
    evaluation_strategy="epoch",       # Evaluate after each epoch
    learning_rate=2e-5,                # Learning rate
    per_device_train_batch_size=8,     # Batch size for training
    per_device_eval_batch_size=8,      # Batch size for evaluation
    num_train_epochs=3,                # Number of epochs
    weight_decay=0.01,                 # Weight decay to prevent overfitting
    logging_dir="./logs",              # Directory for logs
    save_steps=10_000,                 # Save checkpoint every 10,000 steps
    save_total_limit=2,                # Limit the number of saved checkpoints
)

# Initialize the Trainer
trainer = Trainer(
    model=model,                       # The model to train
    args=training_args,                # Training arguments
    train_dataset=train_dataset,       # Training dataset
    eval_dataset=eval_dataset,         # Evaluation dataset
    tokenizer=tokenizer,               # Tokenizer
)

# Train the model
trainer.train()

# Evaluate the model
trainer.evaluate()

# Save the model and tokenizer
model.save_pretrained("./final_model")
tokenizer.save_pretrained("./final_model")

