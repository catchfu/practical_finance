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
- `practicalfinance.pdf`: The original research paper.
- `Practical finance spreadsheet.xlsx`: The original Excel-based implementation.
- `A Yale Professor’s Investment Formula...pdf`: WSJ article explaining the framework.

## Getting Started

### Web Application

1. Navigate to the app directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Run tests:
   ```bash
   npm test
   ```

## References

Choi, James J., Canyao Liu, and Pengcheng Liu. "Practical Finance: An Approximate Solution to Lifecycle Portfolio Choice." (2025).
