$(document).ready(function () {
    const nbQuestions = 20;
    const topOfCurrentPosition = 10;

    let usersBydate = JSON.parse(document.getElementById('users_by_date').textContent);
    let usersByLevel = JSON.parse(document.getElementById('users_by_level').textContent);
    let scoreAndProgressBylevel = JSON.parse(document.getElementById('avg_score_and_progress_by_level').textContent);
    let questionsSuccessRate = JSON.parse(document.getElementById('questions_success_rate').textContent);
    let users_current_position = JSON.parse(document.getElementById('users_current_position').textContent);
    let durationBylevel = JSON.parse(document.getElementById('average_duration_by_level').textContent);

    let aggregatedUsersStartedByYearDate = aggregateByYear(usersBydate.filter(user => !user.is_unstarted));
    let aggregatedUsersUnStartedByYearDate = aggregateByYear(usersBydate.filter(user => user.is_unstarted));
    let aggregatedUsersStartedByMonthDate = aggregateByMonthAndYear(usersBydate.filter(user => !user.is_unstarted));
    let aggregatedUsersUnStartedByMonthDate = aggregateByMonthAndYear(usersBydate.filter(user => user.is_unstarted));
    let successRateByQuestion = aggregateQuestionsByLevel(questionsSuccessRate);
    let questionLabels = getQuestionLabels(successRateByQuestion, nbQuestions);
    let successRateByQuiz = aggregateQuizByLevel(questionsSuccessRate);
    let quizLabels = getQuestionLabels(successRateByQuiz)
    let successRateByCategory = aggregateByCategory(questionsSuccessRate);
    let categoryLabels = Object.keys(successRateByCategory);
    let categories_values = Object.values(successRateByCategory);
    let user_dates_year = [...new Set(Object.keys(aggregatedUsersStartedByYearDate).concat(Object.keys(aggregatedUsersUnStartedByYearDate)).sort())];
    let user_dates_year_values = [
        { label: 'started', data: user_dates_year.map(year => aggregatedUsersStartedByYearDate[year] || 0) },
        { label: 'unstarted', data: user_dates_year.map(year => aggregatedUsersUnStartedByYearDate[year] || 0) }
    ];
    let user_dates_month = [...new Set(Object.keys(aggregatedUsersStartedByMonthDate).concat(Object.keys(aggregatedUsersUnStartedByMonthDate)).sort())];
    let user_dates_month_values =[
        { label: 'started', data: user_dates_month.map(month => aggregatedUsersStartedByMonthDate[month] || 0) },
        { label: 'unstarted', data: user_dates_month.map(month => aggregatedUsersUnStartedByMonthDate[month] || 0) }
    ];

    let user_levels = usersByLevel.map(user => `Level ${user.level_index}: ${user.level_name}`);
    let user_levels_values = usersByLevel.map(user => user.count);
    let score_levels = scoreAndProgressBylevel.map(user => `Level ${user.level_index}: ${user.level_name}`);
    let score_user_values = scoreAndProgressBylevel.map(user => user.count);
    let score_levels_values = scoreAndProgressBylevel.map(user => user.avg_score / 100);
    let progress_levels_values = scoreAndProgressBylevel.map(user => user.avg_progress / 100);
    let user_current_position = users_current_position.map(position => `Level ${position.current_level__index} Slide ${position.current_position}`).slice(0, topOfCurrentPosition);
    let user_current_position_values = users_current_position.map(position => position.total_users).slice(0, topOfCurrentPosition);
    let durationLabels = durationBylevel.map(d => `Level ${d.level_index}: ${d.level_name}`);
    let duration_values = durationBylevel.map(d => d.avg_duration);

    const users_by_year_ctx = document.getElementById('users_by_year_chart');
    const users_by_month_ctx = document.getElementById('users_by_month_chart');
    const users_by_level_ctx = document.getElementById('users_by_level_chart');
    const users_and_score_by_level_ctx = document.getElementById('users_and_score_by_level_chart');
    const users_and_progress_by_level_ctx = document.getElementById('users_and_progress_by_level_chart');
    const success_rate_by_question_ctx = document.getElementById('success_rate_by_question_chart');
    const success_rate_by_quiz_ctx = document.getElementById('success_rate_by_quiz_chart');
    const success_rate_by_knowledge_ctx = document.getElementById('success_rate_by_knowledge_chart');
    const users_current_position_ctx = document.getElementById('users_current_position_chart');
    const duration_by_level_ctx = document.getElementById('duration_by_level_chart');


    drawMatrixActivityChart(usersBydate);

    drawSingleAxisChart(
        'bar',
        users_by_year_ctx,
        user_dates_year,
        user_dates_year_values,
        'time',
        'year',
        true
    );

    drawSingleAxisChart(
        'bar',
        users_by_month_ctx,
        user_dates_month,
        user_dates_month_values,
        'time',
        'month',
        true
    );

    drawSingleAxisChart(
        'bar',
        users_by_level_ctx,
        user_levels,
        user_levels_values,
    );

    drawMultipleAxisChart(
        'bar',
        users_and_score_by_level_ctx,
        score_levels,
        'Users',
        score_user_values,
        'Average score',
        score_levels_values
    );

    drawMultipleAxisChart(
        'bar',
        users_and_progress_by_level_ctx,
        score_levels,
        'Users',
        score_user_values,
        'Average progress',
        progress_levels_values
    );

    drawRadarChart(
        success_rate_by_question_ctx,
        questionLabels,
        successRateByQuestion,
        nbQuestions
    );

    drawRadarChart(
        success_rate_by_quiz_ctx,
        quizLabels,
        successRateByQuiz,
    );

    drawLinePercentChart(
        success_rate_by_knowledge_ctx,
        categoryLabels,
        categories_values
    );

    drawLinePieChart(
        users_current_position_ctx,
        user_current_position,
        user_current_position_values
    );

    drawDurationChart(
        duration_by_level_ctx,
        durationLabels,
        duration_values,
    )

    function drawMatrixActivityChart(data, start_date) {
        $('#surveys-activity').github_graph({
            start_date: start_date ? start_date : null,
            data: usersBydate,
            texts: ['user', 'users'],
            click: function (date, count) {
                let clickDate = new Date(date);
                let pastYear = clickDate.setFullYear(clickDate.getFullYear() - 1);
                drawMatrixActivityChart(usersBydate, pastYear);
            }
        });
    }

    function drawSingleAxisChart(chartType, ctx, labels, values, typeXaxis = 'category', timeUnit = 'year', multiseries = false) {
        timeformat = {
            unit: timeUnit,
            tooltipFormat: timeUnit == 'year' ? 'yyyy' : 'MMM yyyy',
        },
            new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: multiseries ? values : [{ data: values }],
                },
                options: {
                    plugins: {
                        legend: {
                            display: multiseries
                        }
                    },
                    responsive: true,
                    scales: {
                        x: {
                            type: typeXaxis,
                            time: timeformat,
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                            }
                        }
                    },
                },
            });
    }

    function drawMultipleAxisChart(chartType, ctx, labels, legendYaxis, valuesYaxis, legendY2axis, valuesY2axis, typeXaxis = 'category') {
        new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: legendYaxis,
                        data: valuesYaxis,
                        yAxisID: 'y',
                        order: 1
                    },
                    {
                        label: legendY2axis,
                        data: valuesY2axis,
                        yAxisID: 'y2',
                        type: 'line',
                        order: 0
                    },
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: typeXaxis,
                    },
                    y: {
                        type: 'linear',
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                        }
                    },
                    y2: {
                        type: 'linear',
                        position: 'right',
                        suggestedMax: 1,
                        suggestedMin: 0,
                        beginAtZero: true,
                        ticks: {
                            format: {
                                style: 'percent',
                                minimumFractionDigits: 0
                            },
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
            },
        });
    }

    function drawRadarChart(ctx, labels, values, nbElements) {
        let datasets = [];
        for (let key in values) {
            let data = values[key].map(value => value.success_rate).flat();
            datasets.push(
                {
                    label: key,
                    data: nbElements ? data.slice(0, nbElements) : data,
                }
            )
        }

        new Chart(ctx, {
            type: "radar",
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.raw.toFixed()}%`;
                            }
                        }
                    }
                },
                responsive: true,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return `${value}%`;
                            }
                        }
                    },
                },
            },
        });
    }

    function drawLinePercentChart(ctx, labels, values) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    y: {
                        suggestedMax: 1,
                        suggestedMin: 0,
                        beginAtZero: true,
                        ticks: {
                            format: {
                                style: 'percent',
                                minimumFractionDigits: 0
                            },
                        },
                    }
                },
            },
        });
    }

    function drawLinePieChart(ctx, labels, values) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                responsive: true,
            },
        });
    }



    function drawDurationChart(ctx, labels, values) {
        new Chart(ctx, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                }]
            },
            options: {
                responsive: true,
                layout: {
                    padding: 10
                },
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        type: 'linear',
                        grid: {
                            display: false,
                        },
                        ticks: {
                            display: false
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: context => secondsToLabel(context.raw)
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        clamp: true,
                        offset: 0,
                        padding: {
                            top: 0,
                            bottom: 0
                        },
                        font: {
                            weight: 'bold',
                        },
                        formatter: value => secondsToLabel(value)
                    },
                },

            },
        });
    }
    function aggregateByYear(data) {
        return data.reduce((acc, entry) => {
            const year = new Date(entry.timestamp);
            const yearKey = year.getFullYear();
            if (!acc[yearKey]) {
                acc[yearKey] = 0;
            }
            acc[yearKey] += entry.count;
            return acc;
        }, {});
    }

    function aggregateByMonthAndYear(data) {
        return data.reduce((acc, entry) => {
            const date = new Date(entry.timestamp);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const yearMonthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            if (!acc[yearMonthKey]) {
                acc[yearMonthKey] = 0;
            }
            acc[yearMonthKey] += entry.count;
            return acc;
        }, {});
    }

    function aggregateQuestionsByLevel(data) {
        return data
            .filter(question => !question.quiz_id)
            .reduce((acc, obj) => {
                obj.success_rate = obj.success_rate === null ? 0.0 : obj.success_rate * 100;
                const key = obj.level__translations__name;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
    }

    function aggregateQuizByLevel(data) {
        let filterData = data.filter(question => question.quiz_id)
        const quizIds = filterData.map(item => item.quiz_id);
        const uniqueQuizIds = [...new Set(quizIds)];

        return filterData.reduce((acc, obj) => {
            obj.success_rate = obj.success_rate * 100;
            const key = obj.level__translations__name;
            const quizIndex = uniqueQuizIds.indexOf(obj.quiz_id);
            acc[key] = acc[key] || [];
            acc[key][quizIndex] = acc[key][quizIndex] || obj;
            acc[key][quizIndex].success_rate = (acc[key][quizIndex].success_rate + obj.success_rate) / 2;
            return acc;
        }, {});
    }

    function aggregateByCategory(data) {
        return data.reduce((acc, obj) => {
            if (!obj.categories && obj.quiz_id) {
                let quizCategories = data.find(c => c.quiz_id === obj.quiz_id && c.categories).categories;
                obj.categories = quizCategories
            }

            const key = obj.categories;

            if (key) {
                let success_rate = obj.success_rate / 100
                if (!acc[key]) {
                    acc[key] = success_rate;
                } else {
                    acc[key] = (acc[key] + success_rate) / 2;
                }
            }
            return acc;
        }, {});
    }

    function getQuestionLabels(data, nbElements) {
        if (Object.keys(data).length === 0) return [];
        let labels = [];
        data[Object.keys(data)[0]].map((value, index) => {
            labels.push(`Q${index + 1}`);
        })
        return nbElements ? labels.slice(0, nbElements) : labels
    }

    function secondsToLabel(seconds) {
        let days = Math.floor(seconds / 86400);
        let remaining_hours = seconds % 86400;
        let remaining_minutes = remaining_hours % 3600
        let hours = Math.floor(remaining_hours / 3600);
        let minutes = Math.floor(remaining_minutes / 60);
        let remaining_seconds = Math.round(remaining_minutes / 60)
        let label = "";
        if (days > 0) {
            label += days + "d";
        }
        if (hours > 0) {
            label += " " + hours + "h";
        }
        if (minutes > 0) {
            label += " " + minutes + "m";
        }
        if (remaining_seconds > 0) {
            label += " " + remaining_seconds + "s";
        }
        return label;
    }
});
