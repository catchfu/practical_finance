# Practical Finance Calculator

This project provides a modern web-based implementation of the "Practical Finance" framework developed by James J. Choi (Yale University), Canyao Liu, and Pengcheng Liu.

## Overview

Traditional retirement planning often relies on simple rules of thumb (like "100 minus age" for stock allocation). This project implements a more rigorous approach that treats **Human Capital** (the present value of future labor income) as a bond-like asset. 

By accounting for this "implicit bond" holding, the model typically recommends a much higher equity allocation for younger investors, which naturally shifts toward conservative levels as they age and their human capital depletes.

### Key Features

- **Dynamic Human Capital Calculation**: Uses regression-based discount rates that vary by age and employment status.
- **Merton Approximation**: Recommends equity share based on total wealth (financial + human capital).
- **Interactive Dashboard**: Real-time lifecycle charts and editable income streams.
- **Verified Logic**: Unit tests confirm calculations against the original research paper's baseline cases.

## Project Structure

- `/app`: The React + TypeScript + Vite web application.

*Note: Original research documents and spreadsheets have been removed to avoid potential licensing issues. Please refer to the official documentation link below.*

## References

[Choi, James J., Canyao Liu, and Pengcheng Liu. "Practical Finance: An Approximate Solution to Lifecycle Portfolio Choice." (2025)](https://docs.google.com/document/d/1hykGDl6ZHJmDJmIJ706nErIKg5gWeoTxagnEvpWmuwA/preview)
