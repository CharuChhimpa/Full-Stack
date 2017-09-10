import psycopg2

DBNAME = "news"


def get_query_results(query):
    """Return query results for give query"""
    db = psycopg2.connect(database=DBNAME)
    c = db.cursor()
    c.execute(query)
    query_r = c.fetchall()
    db.close()
    return query_r


def print_query_results(query_results):
    """Print query result"""
    print (query_results[1])
    for index, results in enumerate(query_results[0]):
        print (
            "\t", index+1, "-", results[0],
            "\t - ", str(results[1]), "views")


def print_error_results(query_results):
    """Prints the end result of query"""
    print (query_results[1])
    for results in query_results[0]:
        print ("\t", results[0], "-", str(results[1]) + "% errors")


""" create  article _view using this query :

    "create view article_views as select title, author, count(*) as views
    from articles, log where log.path like concat('%',articles.slug)
    group by articles.title, articles.author order by views desc"
"""

# First question
query_1_title = "What are the most popular three articles of all time?"
query_1 = "select title, views from article_view limit 3"

# Second question
query_2_title = "Who are the most popular article authors of all time?"
query_2 = ("select authors.name, sum(article_view.views) as author_views "
           "from authors, article_view where authors.id = article_view.author "
           "group by authors.name order by author_views desc"
           )

""" create error_requests view:
    "create view error_requests as
    select date(time), count(*) as errors
    from log where status like '404%'
    group by date(time) order by errors desc;"
"""

""" create total_request view:
    "create view total_requests as
    select date(time), count(*) as requests
    from log group by date(time) order by requests desc;"
"""

# Third question
query_3_title = "On which days did more than 1% of requests lead to errors?"
query_3 = ("select total_requests.date, 100.0*errors/requests "
           "as error_percent from total_requests, error_requests "
           "where total_requests.date = error_requests.date "
           "and 100.0*errors/requests > 1.0")

if __name__ == '__main__':
    # get query results
    query_1_results = get_query_results(query_1), query_1_title
    query_2_results = get_query_results(query_2), query_2_title
    query_3_results = get_query_results(query_3), query_3_title

    # print query results
    print_query_results(query_1_results)
    print_query_results(query_2_results)
    print_error_results(query_3_results)
