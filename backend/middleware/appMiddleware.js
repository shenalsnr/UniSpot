import express from "express";
import cors from "cors";

export const applyMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
};
