class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryObj = { ...this.queryStr };
        const excludedField = ['page', 'sort', 'limit', 'fields'];
        excludedField.forEach(el => delete queryObj[el]);
    
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }
    sorting() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-createdDate');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fieldBy = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fieldBy);
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        if (this.queryStr.page || this.queryStr.limit) {
            const page = this.queryStr.page * 1 || 1;
            const limit = this.queryStr.limit * 1 || 100;
            const skip = (page - 1) * limit;
            // const numTour = await Tour.countDocuments();

            this.query = this.query.skip(skip).limit(limit);

        }
        return this;
    }
}

module.exports = APIFeatures;