module.exports = class User{
    constructor({id, fullname, lastName, phoneNumber, email, booth}){
        this.id = id;
        this.fullname = fullname;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.booth = booth;
    }

    static fromJson(json){
        return new User({
            id: json['id'],
            email: json['email'],
            phonenumber: json['phone_number'],
            email: json['email'],
            fullname: json['fullname'],
            booth: json['booth'],
        });
    }

    static fromDocToJson(doc){
        let data = doc.data();
        return {
            uid: doc.id,
            email: data['email'],
            phonenumber: data['phonenumber'],
            fullname: data['fullname'],
            booth: data['booth'],
        }
    }
}

