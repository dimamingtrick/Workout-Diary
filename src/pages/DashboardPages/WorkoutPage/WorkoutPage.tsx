import React, { useEffect, useCallback } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useObserver } from "mobx-react";
import { Button, Modal } from "antd";

import { Page, Header } from "../../../components/common";
import { ExerciseList } from "../../../components/Exercise";
import { useStores } from "../../../hooks";
import { Exercise } from "../../../models/workout.model";
import "./workout-page.scss";

const WorkoutPage: React.FC = () => {
  const { push } = useHistory();
  const { url } = useRouteMatch();
  const { WorkoutStore } = useStores();

  useEffect(() => {
    const workoutPageScrollTop = localStorage.getItem("workoutPageScrollTop");
    document.querySelector(".workout-page")!.scrollTop =
      Number(workoutPageScrollTop) || 0;

    return () => {
      const scrollTop = document.querySelector(".workout-page")!.scrollTop;
      localStorage.setItem("workoutPageScrollTop", `${scrollTop}`);
    };
  }, []);

  const handleStartWorkout = useCallback(() => {
    WorkoutStore.startWorkout();
  }, [WorkoutStore]);

  const handleCancelWorkout = useCallback(() => {
    Modal.confirm({
      title: "Do you want to cancel this workout ?",
      content: "You will not be able to return it",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      maskClosable: true,
      transitionName: "fade",
      centered: true,
      onOk: () => WorkoutStore.cancelWorkout()
    });
  }, [WorkoutStore]);

  const handleFinishWorkout = useCallback(() => {
    WorkoutStore.finishWorkout().catch(err => {
      Modal.error({
        title: err,
        okType: "danger",
        maskClosable: true,
        transitionName: "fade",
        centered: true
      });
    });
  }, [WorkoutStore]);

  const handleAddExercise = useCallback(() => {
    if (!WorkoutStore.currentExercise) {
      WorkoutStore.startNewExercise();
    }
    push(`${url}/current-exercise`);
  }, [WorkoutStore, push, url]);

  const handleEditExercise = useCallback(
    (exercise: Exercise) => {
      WorkoutStore.editExercise(exercise);
      push(`${url}/current-exercise`);
    },
    [WorkoutStore, push, url]
  );

  const handleDeleteExercise = useCallback(
    (exercise: Exercise) => {
      Modal.confirm({
        title: "Do you want to delete this exercise ?",
        content: "You will not be able to return it",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        maskClosable: true,
        transitionName: "fade",
        centered: true,
        onOk: () => WorkoutStore.deleteExercise(exercise)
      });
    },
    [WorkoutStore]
  );

  const handleExerciseCollapse = useCallback(
    (openExerciseData: { number: number; isOpen: boolean }) => {
      WorkoutStore.toggleOpenExercise(openExerciseData);
    },
    [WorkoutStore]
  );

  const getOpenExercises = useCallback(
    (number: number) => {
      return WorkoutStore.openExercises.find(i => i === number) &&
        WorkoutStore.isRunning
        ? true
        : false;
    },
    [WorkoutStore]
  );

  return useObserver(() => (
    <>
      <Header left="Workout" />
      <Page
        className={`workout-page ${
          !WorkoutStore.isRunning ? "is-running" : ""
        }`}
      >
        {!WorkoutStore.isRunning && (
          <Button onClick={handleStartWorkout} size="large">
            Start workout
          </Button>
        )}
        {WorkoutStore.isRunning && (
          <>
            <ExerciseList
              exercises={WorkoutStore.exercises}
              onExerciseEditClick={handleEditExercise}
              onExerciseDeleteClick={handleDeleteExercise}
              isOpen={getOpenExercises}
              onExerciseCollapse={handleExerciseCollapse}
            />
            <Button
              className="add-exercise-btn"
              onClick={handleAddExercise}
              disabled={WorkoutStore.isFinishing}
            >
              {WorkoutStore.currentExercise?.name
                ? `Continue current exercise (${WorkoutStore.currentExercise.name})`
                : "Add exercise"}
            </Button>
          </>
        )}
      </Page>
      {WorkoutStore.isRunning && (
        <div className="exercise-actions">
          <Button
            type="danger"
            onClick={handleCancelWorkout}
            disabled={WorkoutStore.isFinishing}
          >
            Cancel Workout
          </Button>
          <Button
            type="primary"
            className="finish-workout-button"
            onClick={handleFinishWorkout}
            disabled={WorkoutStore.isFinishButtonDisabled}
            loading={WorkoutStore.isFinishing}
          >
            Finish Workout
          </Button>
        </div>
      )}
    </>
  ));
};

export default WorkoutPage;
