const getMe = async (req, res) => {

    try {

        return res.status(200).json({

            success: true,

            user: req.user
        });


    } catch (error) {

        console.error(
            "Get user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to get user details"
        });
    }
};


export default getMe;